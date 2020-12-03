import AsyncStorage from "@react-native-community/async-storage"
import analytics from '@react-native-firebase/analytics'
import { filter, indexOf, map, sumBy } from "lodash"
import { values } from "mobx"
import { flow, getEnv, Instance, types } from "mobx-state-tree"
import moment from "moment"
import { localStorageMixin, Query } from "mst-gql"
import DeviceInfo from 'react-native-device-info'
import { translate } from "../i18n"
import { sameDay, sameMonth } from "../utils/date"
import { AccountType, CurrencyType } from "../utils/enum"
import { isIos } from "../utils/helper"
import { uploadToken } from "../utils/notifications"
import { Token } from "../utils/token"
import { RootStoreBase } from "./RootStore.base"
import { TransactionModel } from "./TransactionModel"

export const ROOT_STATE_STORAGE_KEY = "rootAppGaloy"


const gql_all = `
prices(length: $length) {
  __typename
  id
  o
}
maps {
  __typename
  id
  title
  username
  coordinate {
      __typename
      latitude
      longitude
  }
}
nodeStats {
  __typename
  id
}`

const gql_query_logged = `
query gql_query_logged($length: Int) {
  ${gql_all}
  earnList {
    __typename
    id
    value
    completed
  }
  wallet {
    __typename
    id
    balance
    currency
    transactions {
      __typename
      id
      amount
      description
      created_at
      hash
      type
      usd
      fee
      feeUsd
      pending
    }
  }
  getLastOnChainAddress {
    __typename
    id
  }
  me {
    __typename
    id
    level
    username
    phone
  }
}
`

// TODO add: me.contacts


const gql_query_anonymous = `
query gql_query_anonymous($length: Int) {
  ${gql_all}
  earnList {
    __typename
    id
    value
  }
}
`

const isToday = (tx) => {
  return sameDay(tx.date, new Date())
}

const isYesterday = (tx) => {
  return sameDay(tx.date, new Date().setDate(new Date().getDate() - 1))
}

const isThisMonth = (tx) => {
  return sameMonth(tx.date, new Date())
}


export interface RootStoreType extends Instance<typeof RootStore.Type> {}

export const OnboardingModel = types.model("Onboarding", {
  getStarted: types.optional(types.boolean, false),
}).actions(self => ({
  getStartedCompleted() { self.getStarted = true },
}))
  
export const RootStore = RootStoreBase
// .extend(
//   localStorageMixin({
//     storage: AsyncStorage,
//     // throttle: 1000,
//     storageKey: ROOT_STATE_STORAGE_KEY
// }))
.props({
  onboarding: types.optional(OnboardingModel, {}),
  modalClipboardVisible: types.optional(types.boolean, false), // when switching been app, should we show modal when returning to Galoy?
  prefCurrency: types.optional(types.string, "USD"), // which currency to show from the app
})
.actions(self => {
  // This is an auto-generated example action.
  const log = () => {
    console.log(JSON.stringify(self))
  }

  const mainQuery = (): Query => {
    const query = new Token().has() ? gql_query_logged : gql_query_anonymous
    return self.query(query, {
      length: 1
    })
  }

  const setModalClipboardVisible = (value): void => {
    self.modalClipboardVisible = value
  }

  const updatePendingInvoice = async (hash): Promise<boolean> => {
    // lightning
    const query = `mutation updatePendingInvoice($hash: String!) {
      invoice {
        updatePendingInvoice(hash: $hash)
      }
    }`

    const result = await self.mutate(query, { hash })
    return result.invoice.updatePendingInvoice
  }

  const sendPayment = async ({paymentType, invoice, amountless, optMemo, address, amount, username}) => {
    let success, result, pending, errors

    let query, variables

    if(paymentType === "lightning") {
      query = `mutation payInvoice($invoice: String!, $amount: Int, $memo: String) {
        invoice {
          payInvoice(invoice: $invoice, amount: $amount, memo: $memo)
        }
      }`  
      variables =  {invoice, amount: amountless ? amount : undefined, memo: optMemo}
    } else if (paymentType === "onchain"){
      query = `mutation onchain($address: String!, $amount: Int!, $memo: String) {
        onchain {
          pay(address: $address, amount: $amount, memo: $memo) {
            success
          }
        }
      }`
      variables = {address, amount, memo: optMemo}
    } else if (paymentType === "username") {
      query = `mutation payKeysendUsername($amount: Int!, $destination: String!, $username: String!, $memo: String) {
        invoice {
            payKeysendUsername( amount: $amount, destination: $destination, username: $username, memo: $memo)
        }
      }`
      variables = { amount, destination: self.myPubKey, username, memo: optMemo }
    }

    try {
      result = await self.mutate(query, variables)
    } catch (err) {
      errors = err?.response?.errors ?? [{message: `An error occured\n${err}`}]
    }

    if(paymentType === "lightning") {
      success = result?.invoice?.payInvoice === "success" ?? false
      pending = result?.invoice?.payInvoice === "pending" ?? false
    } else if (paymentType === "onchain") {
      success = result?.onchain?.pay?.success
    } else if (paymentType === "username") {
      success = result?.invoice?.payKeysendUsername === "success"
    }

    return { success, pending, errors }
  } 

  const nextPrefCurrency = () => {    
    const units = ["sats", "USD"] // "BTC"
    const currentIndex = indexOf(units, self.prefCurrency)
    self.prefCurrency = units[(currentIndex + 1) % units.length]
  }

  // FIXME need function* / yield instead?
  const earnComplete = async (id) => {
    const earn = self.earns.get(id)
    if (earn.completed) {
      return
    }

    const token = new Token().has()

    analytics().logEvent('earn', {
      id,
      loggedIn: !!token // FIXME: don't know if that is already a given?
    })

    if (!token) {
      earn.completed = true
      self.earns.set(id, earn)
      
      const amount = earn.value
      
      const tx = TransactionModel.create({
        __typename: "Transaction",
        id,
        amount,
        description: id,
        created_at: moment().unix(),
        hash: null,
        type: "earn"
      })
      
      self.transactions.set(id, tx)
      console.tron.log("transaction:", self.transactions)
      
      self.wallet("BTC").transactions.push(id)
      self.wallet("BTC").balance += amount
    } else {
      await self.mutateEarnCompleted({ids: [id]}, "__typename, id, completed")
      await self.queryWallet()
    }
  }

  const loginSuccessful = flow(function*() {
    analytics().logLogin({ method: "phone" })

    getEnv(self).gqlHttpClient.setHeaders({authorization: new Token().bearerString})

    // sync the earned quizzes
    const ids = map(filter(values(self.earns), {completed: true}), "id")
    yield self.mutateEarnCompleted({ids})

    console.tron.log("succesfully update earns id")
    
    self.transactions.clear()
    self.wallets.get("BTC").transactions.clear()
    
    console.tron.log("cleared local transactions")

    // FIXME: only for android?
    // it seems we also have a token for iOS, without the permissions to show it though
    console.tron.log("sending device token for notifications")
    yield uploadToken(self)

    try {
      yield self.mainQuery()
    } catch (err) {
      console.tron.warn({err})
    }
    
  })

  const isUpdateRequired = () => {
    // FIXME cache issue
    const { minBuildNumberAndroid, minBuildNumberIos } = values(self.buildParameters)[self.buildParameters.size - 1]
    const minBuildNumber = isIos ? minBuildNumberIos : minBuildNumberAndroid
    let buildNumber = Number(DeviceInfo.getBuildNumber())
    return buildNumber < minBuildNumber
  }

  const isUpdateAvailable = () => {
    // FIXME cache issue
    const {lastBuildNumberAndroid, lastBuildNumberIos } = values(self.buildParameters)[self.buildParameters.size - 1]
    const lastBuildNumber = isIos ? lastBuildNumberIos : lastBuildNumberAndroid
    let buildNumber = Number(DeviceInfo.getBuildNumber())
    return buildNumber < lastBuildNumber
  }


  return { log, earnComplete, loginSuccessful, setModalClipboardVisible, nextPrefCurrency, mainQuery, 
    updatePendingInvoice, sendPayment, isUpdateRequired, isUpdateAvailable }
})
.views((self) => ({
  // workaround on the fact key can't be enum
  rate(currency: CurrencyType) {
    if (currency === CurrencyType.USD) {
      return 1
    } else if (currency === CurrencyType.BTC) {
      const p = values(self.prices)
      if (p.length > 0) {
        return p[p.length - 1].o
      } else {
        return 1 // FIXME
      }
    } else {
      throw Error(`currency ${currency} doesn't exist`)
    }
  },
  get user() {
    const users = values(self.users)
    return !!users.length ? users[0] : {
      id: "incognito",
      level: 0,
    }
  },
  get earnedSat() {
    return sumBy(filter(values(self.earns), {completed: true}), "value")
  },
  wallet(currency) {
    return values(self.wallets).filter(item => item.currency === currency)[0]
  },
  balance(currency) {
    const wallet = self.wallet(currency)
    return wallet.balance
  },
  balances({ currency, account }) {
    const balances = {}

    const btcConversion = self.rate("BTC") / self.rate(currency)

    balances[AccountType.Bitcoin] = self.balance("BTC") * btcConversion
    balances[AccountType.Bank] = self.balance("USD") / self.rate(currency)
    balances[AccountType.BankAndBitcoin] =
      balances[AccountType.Bank] + balances[AccountType.Bitcoin]

    return balances[account]
  },

  lastTransactions(length: 3) {
    return values(self.wallets.get("BTC").transactions)[length]
  },

  get transactionsSections() {
    const sections = []
    const today = []
    const yesterday = []
    const thisMonth = []
    const before = []
  
    let transactions = values(self.wallets.get("BTC").transactions)
    
    while (transactions.length) {
      // this could be optimized
      let tx = transactions.shift()
  
      if (isToday(tx)) {
        today.push(tx)
      } else if (isYesterday(tx)) {
        yesterday.push(tx)
      } else if (isThisMonth(tx)) {
        thisMonth.push(tx)
      } else {
        before.push(tx)
      }
    }
  
    if (today.length > 0) {
      sections.push({ title: translate("PriceScreen.today"), data: today })
    }
  
    if (yesterday.length > 0) {
      sections.push({ title: translate("PriceScreen.yesterday"), data: yesterday })
    }
  
    if (thisMonth.length > 0) {
      sections.push({ title: translate("PriceScreen.thisMonth"), data: thisMonth })
    }
  
    if (before.length > 0) {
      sections.push({ title: translate("PriceScreen.prevMonths"), data: before })
    }
  
    // console.tron.log({sections})
    return sections
  },

  get walletIsActive() { return self.user.level > 0 },
  get username() { return self.user.username },

  // FIXME why do we need a default value?
  // this should not be used when not logged in
  get myPubKey() { return self.nodeStats ? values(self.nodeStats)[0].id : ""}
}))
  // return in BTC instead of SAT
  // get getInBTC() {
  //   return (self.BTC * Math.pow(10, 8))
  // }
