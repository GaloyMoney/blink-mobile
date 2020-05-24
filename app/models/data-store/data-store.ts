import auth from "@react-native-firebase/auth"
import functions from "@react-native-firebase/functions"
import { flow, getParentOfType, Instance, SnapshotOut, types } from "mobx-state-tree"
import { IAddInvoiceRequest, IBuyRequest, IPayInvoice, IQuoteRequest, IQuoteResponse, Onboarding, OnboardingEarn, Side } from "../../../../common/types"
import { parseDate } from "../../utils/date"
import { AccountType, CurrencyType } from "../../utils/enum"
import * as lightningPayReq from 'bolt11'
import { translate } from "../../i18n"
import { Alert } from "react-native"

export const FiatTransactionModel = types.model("Transaction", {
  name: types.string,
  icon: types.string,
  amount: types.number,
  date: types.number, // TODO: move to timestamp
  cashback: types.maybe(types.number),
})

// should map ILightningTransaction
export const LightningInvoiceModel = types.model("LightningTransaction", {
  amount: types.number,
  description: types.maybe(types.union(types.string, types.null)),
  created_at: types.Date,
  hash: types.maybe(types.union(types.string, types.null)),
  destination: types.maybe(types.string),
  type: types.string,
  fee: types.maybe(types.number),
})

export const BaseAccountModel = types
  .model("Account", {
    confirmedBalance: NaN,
    unconfirmedBalance: 0,
    type: types.enumeration<AccountType>("Account Type", Object.values(AccountType)),
  })
  .views((self) => ({
    get balance() {
      return self.confirmedBalance + self.unconfirmedBalance
    },
    get transactions() {
      throw new Error("this is an abstract method, need to be implemented in subclass")
    },
  }))

export const QuoteModel = types
  .model("Quote", {
    side: types.union(types.literal("buy"), types.literal("sell")), // Side,
    satPrice: types.maybe(types.number),
    validUntil: types.maybe(types.number), // probably not needed (could be a state in component)
    satAmount: types.maybe(types.number), // probably not needed (could be a state in component)
    signature: types.maybe(types.string),
    invoice: types.maybe(types.string),
  })
  .actions((self) => ({
    reset() {
      // TODO there must be better way to do this
      self.satAmount = self.satPrice = self.validUntil = NaN
      self.signature = self.invoice = undefined
    },
  }))

export const ExchangeModel = types
  .model("Exchange", {
    quote: types.optional(QuoteModel, { side: "buy" }),
  })
  .actions((self) => {
    const assertTrade = (side: Side): void /* success */ => {
      if (self.quote.side !== side) {
        throw new Error(`trying to ${side} but quote is for ${self.quote.side}`)
      }

      const now = Date.now() / 1000
      if (now > self.quote.validUntil) {
        throw new Error(
          `quote ${self.quote.validUntil} has expired, now is ${now}. ` + `Ask for for a new quote`,
        )
      }
    }

    return {
      quoteLNDBTC: flow(function* ({ side, satAmount }) {
        const request: IQuoteRequest = { side }

        if (side === "sell") {
          request.satAmount = satAmount
        } else if (side === "buy") {
          const invoice = yield getParentOfType(self, DataStoreModel).lnd.addInvoice({
            value: satAmount,
            memo: "Buy BTC",
            expiry: 30, // seconds
          })
          request.invoice = invoice.paymentRequest
        }

        const {data} = yield functions().httpsCallable("quoteLNDBTC")(request)

        // @ts-ignore FIXME not sure why but it seems necessary. it seems typescript doesn't get maybe?
        self.quote = data as IQuoteResponse

        const invoiceJson = lightningPayReq.decode(self.quote.invoice)
        console.tron.log({invoiceJson})

        // TODO/FIXME
        // if (side === "sell") {
        //   self.quote.satPrice = parseFloat(JSON.parse(invoiceJson.).satPrice)
        // }

        self.quote.satAmount = invoiceJson.satoshis // FIXME if millisats is used
        self.quote.validUntil = invoiceJson.timeExpireDate // FIXME: test if this works
      }),

      buyLNDBTC: flow(function* () {
        try {
          assertTrade("buy")

          const request: IBuyRequest = {
            //@ts-ignore
            side: self.quote.side,
            invoice: self.quote.invoice,
            satPrice: self.quote.satPrice,
            signature: self.quote.signature,
          }

          const result = yield functions().httpsCallable("buyLNDBTC")(request)
          console.tron.log("result BuyLNDBTC", result)
          return result?.data?.success ?? false
        } catch (err) {
          console.tron.warn(err.toString())
          throw err
        }
      }),

      sellLNDBTC: flow(function* () {
        try {
          assertTrade("sell")
          console.tron.log(self.quote.invoice)

          const result = yield getParentOfType(self, DataStoreModel).lnd.payInvoice({
            paymentRequest: self.quote.invoice,
          })
          console.tron.log("result SellLNDBTC", result)
          return result
        } catch (err) {
          console.tron.warn(err.toString())
          throw err
        }
      }),
    }
  })

export const FiatAccountModel = BaseAccountModel.props({
  type: AccountType.Bank,
  _transactions: types.array(FiatTransactionModel),
})
  .actions((self) => {
    const updateTransactions = flow(function* () {
      let uid
      try {
        uid = auth().currentUser.uid
      } catch (err) {
        console.tron.log("can't get auth().currentUser.uid", err)
      }
      try {
        // TODO show transaction
        // const doc = yield firestore().doc(`users/${uid}`).get()
        // self._transactions = doc.data().transactions
      } catch (err) {
        console.tron.warn(`not able to update transaction ${err}`)
      }
    })

    const updateBalance = flow(function* () {
      if (getParentOfType(self, DataStoreModel).onboarding.has(Onboarding.bankOnboarded)) {
        try {
          const result = yield functions().httpsCallable("getFiatBalances")({})
          console.tron.log("balance", result)
          if ("data" in result) {
            self.confirmedBalance = result.data
            // TODO: add unconfirmed balance
          }
        } catch (err) {
          console.tron.warn(`can't fetch the balance ${err}`)
        }
      } else {
        self.confirmedBalance = 0
      }
    })
    const update = flow(function* () {
      yield updateBalance()
      yield updateTransactions()
    })

    return { updateBalance, updateTransactions, update }
  })
  .views((self) => ({
    get currency() {
      return CurrencyType.USD
    },
    get transactions() {
      return self._transactions.map((tx) => ({
        name: tx.name,
        icon: tx.icon,
        amount: tx.amount,
        date: parseDate(tx.date), // FIXME timestamp
        cashback: tx.cashback,
      }))
    },
  }))

export const LndModel = BaseAccountModel.named("Lnd")
  .props({
    type: AccountType.Bitcoin,
    _transactions: types.array(LightningInvoiceModel),
  })
  .actions((self) => {
    return {
      update: flow(function* () {
        //@ts-ignore not sure why that is
        yield self.updateTransactions()
        //@ts-ignore not sure why that is
        yield self.updateBalance()
      }),

      updateBalance: flow(function* () {
        if (getParentOfType(self, DataStoreModel).onboarding.has(Onboarding.phoneVerification)) {
          try {
            const { data } = yield functions().httpsCallable("getLightningBalance")({})
            self.confirmedBalance = data
          } catch (err) {
            // TODO show visual indication of internet connection failure
            console.tron.log(err.toString())
          }
        } else {
          yield self.updateTransactions()
          self.confirmedBalance = self._transactions.reduce((acc, value) => value.amount + acc, 0)
        }
      }),

      updateTransactions: flow(function* () {

        // TODO move to utils?
        const translateTitleFromItem = (item) => {
          console.tron.log({ item })
          const object = translate(`EarnScreen.earns`)
          for (const section of object) {
            for (const card of section.content) {
              if (card.id === item) {
                return card.title
              }
            }
          }
          return item
        }

        if (getParentOfType(self, DataStoreModel).onboarding.has(Onboarding.phoneVerification)) {
          try {
            const { data } = yield functions().httpsCallable("getLightningTransactions")({})
            self._transactions = data.map(item => ({
              amount: item.amount,
              description: translateTitleFromItem(item.description), // FIXME. should be done in the backend
              created_at: item.created_at,
              hash: item.hash,
              destination: item.destination,
              type: item.type,
              fee: item.fee,
            }))
          } catch (err) {
            console.tron.warn(`can't fetch the lightning balance ${err}`)
          }
        } else {
          self._transactions = getParentOfType(self, DataStoreModel).onboarding.stage
          .filter(value => OnboardingEarn[value] !== 0)
          .map(
            value => ({
              amount: OnboardingEarn[value],
              description: translateTitleFromItem(value),
              created_at: new Date(),
              type: "earn",
            })
          )
        }
      }),
    }
  })
  .views((self) => ({
    get currency() {
      return CurrencyType.BTC
    },

    get transactions() {
      return self._transactions
    },

    get earned() {
      if (getParentOfType(self, DataStoreModel).onboarding.has(Onboarding.phoneVerification)) {
        return self._transactions
          .filter((value) => value.type === "earn")
          .reduce((acc, value) => value.amount + acc, 0)
      } else {
        return self.confirmedBalance
      }
    }
  }))

export const AccountModel = types.union(FiatAccountModel, LndModel)

const ModelModel = types
  .model("Mode", {
    bitcoin: types.optional(
      types.union(types.literal("mainnet"), types.literal("testnet")),
      "testnet"
  )})
  .actions(self => ({
    update: flow(function* (network) {
      yield auth().signOut()
      getParentOfType(self, DataStoreModel).reset()
      self.bitcoin = network
      Alert.alert("You have succesfully change network. You need to log in again")
    })})
  )

const DEFAULT_BTC = 0.000001

export const RatesModel = types
  .model("Rates", {
    USD: 1, // TODO is there a way to have enum as parameter?
    BTC: DEFAULT_BTC

    // FIXME should be a Pair, not a currency
    // TODO add "last update". refresh only needed if more than 1 or 10 min?
  })
  .volatile(self => ({
    BTC_history: []
  }))
  .actions((self) => {
    const update = flow(function* () {
      try {
        const {data} = yield functions().httpsCallable("getPrice")({})
        self.BTC_history = data
        try {
          self.BTC = self.BTC_history[self.BTC_history.length - 1].o
        } catch (err) {
          console.tron.warn(`don't have rates ${err}`)
          self.BTC = DEFAULT_BTC
        }
      } catch (err) {
        console.tron.warn(`error getting BTC price: ${err}`)
      }
    })
    return { update }
  })
  .views((self) => ({
    // workaround on the fact key can't be enum
    rate(currency: CurrencyType) {
      if (currency === CurrencyType.USD) {
        return self.USD
      } else if (currency === CurrencyType.BTC) {
        return self.BTC
      } else {
        throw Error(`currency ${currency} doesnt't exist`)
      }
    },
    // return in BTC instead of SAT
    get getInBTC() {
      return (self.BTC * Math.pow(10, 8))
    }
  }))

interface BalanceRequest {
  currency: CurrencyType
  account: AccountType
}

export const OnboardingModel = types
  .model("Onboarding", {
    stage: types.array(types.enumeration<Onboarding>("Onboarding", Object.values(Onboarding))),
  })
  .actions((self) => ({
    add: function (step) {
      if (self.stage.findIndex((item) => item == step) === -1) {
        self.stage.push(step)
      }
    }
  }))
  .views((self) => ({
    has(step: Onboarding) {
      return self.stage.findIndex((item) => item == step) !== -1
    },
  }))

export const DataStoreModel = types
  .model("DataStore", {
    onboarding: types.optional(OnboardingModel, {}),
    fiat: types.optional(FiatAccountModel, {}),
    rates: types.optional(RatesModel, {}),
    exchange: types.optional(ExchangeModel, {}),
    lnd: types.optional(LndModel, {}), // TODO should it be optional?
    mode: types.optional(ModelModel, {}),
  })
  .actions((self) => ({
    updateBalance: flow(function* () {
      yield Promise.all([
        yield self.fiat.updateBalance(),
        yield self.lnd.updateBalance(),
      ])
    }),
    reset: flow(function* () {
      self.onboarding = {}
      self.fiat = {}
      self.rates = {}
      self.exchange = {}
      self.lnd = {}
      self.mode = {}
    })
  }))
  .views((self) => ({
    // TODO using: BalanceRequest type, how to set it?
    balances({ currency, account }) {
      const balances = {}

      const btcConversion = self.rates.rate(self.lnd.currency) / self.rates.rate(currency)

      balances[AccountType.Bitcoin] = self.lnd.balance * btcConversion
      balances[AccountType.Bank] = self.fiat.balance / self.rates.rate(currency)
      balances[AccountType.BankAndBitcoin] =
        balances[AccountType.Bank] + balances[AccountType.Bitcoin]

      return balances[account]
    },
  }))

/**
  * Un-comment the following to omit model attributes from your snapshots (and from async storage).
  * Useful for sensitive data like passwords, or transitive state like whether a modal is open.

  * Note that you'll need to import `omit` from ramda, which is already included in the project!
  *  .postProcessSnapshot(omit(["password", "socialSecurityNumber", "creditCardNumber"]))
  */

type DataStoreType = Instance<typeof DataStoreModel>
export interface DataStore extends DataStoreType { }

type DataStoreSnapshotType = SnapshotOut<typeof DataStoreModel>
export interface DataStoreSnapshot extends DataStoreSnapshotType { }

export type LndStore = Instance<typeof LndModel>

type FiatAccountType = Instance<typeof FiatAccountModel>
export interface FiatAccount extends FiatAccountType { }

// type CryptoAccountType = Instance<typeof LndModel> // FIXME is that still accurate?
// export interface CryptoAccount extends CryptoAccountType {}

type RatesType = Instance<typeof RatesModel>
export interface Rates extends RatesType { }
