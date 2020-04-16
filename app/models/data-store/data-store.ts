import auth from "@react-native-firebase/auth"
import firestore from "@react-native-firebase/firestore"
import functions from "@react-native-firebase/functions"
import { difference } from "lodash"
import { flow, getEnv, getParentOfType, Instance, SnapshotOut, types } from "mobx-state-tree"
import DeviceInfo from "react-native-device-info"
import { IBuyRequest, IQuoteRequest, IQuoteResponse, Onboarding, OnboardingRewards, Side } from "types"
import { translate } from "../../i18n"
import { parseDate } from "../../utils/date"
import { AccountType, CurrencyType } from "../../utils/enum"
import { shortenHash } from "../../utils/helper"



// FIXME add as a global var
DeviceInfo.isEmulator().then((isEmulator) => {
  if (isEmulator) {
    functions().useFunctionsEmulator("http://localhost:5000")
  }
})

export const OnChainTransactionModel = types.model("OnChainTransaction", {
  txHash: types.string,
  amount: types.number,
  numConfirmations: types.maybe(types.number), // not sure why it's only set for some of them
  blockHash: types.maybe(types.string), // some mined transactions are not
  blockHeight: types.maybe(types.number), // included here
  timeStamp: types.number,
  destAddresses: types.array(types.string),
  totalFees: types.maybe(types.string), // only set for sending transaction
  rawTxHex: types.string,
})

export const PaymentModel = types.model("Payment", {
  paymentHash: types.string,
  valueSat: types.number,
  feeSat: types.maybe(types.number),
  creationDate: types.number,
  path: types.array(types.string),
  status: types.number, // FIXME should be number
  paymentRequest: types.string,
  paymentPreimage: types.string,
  description: types.maybe(types.string),
})

export const HTLCModel = types.model("HTLC", {
  chanId: types.union(types.string, types.undefined, types.number, types.null),
  // htlcIndex: types.maybe(types.union(types.string, types.undefined, types.number)),
  amtMsat: types.union(types.string, types.undefined, types.number, types.null),
  acceptHeight: types.union(types.string, types.undefined, types.number, types.null),
  acceptTime: types.union(types.string, types.undefined, types.number, types.null),
  resolveTime: types.union(types.string, types.undefined, types.number, types.null),
  expiryHeight: types.union(types.string, types.undefined, types.number, types.null),
  state: types.union(types.string, types.undefined, types.number, types.null),
  mppTotalAmtMsat: types.union(types.string, types.undefined, types.number, types.null),
  // mppTotalAmtMsat: types.maybe(types.string),
  customRecords: types.maybe(types.string),
})

export const InvoiceModel = types.model("Invoice", {
  memo: types.maybe(types.string),
  receipt: types.maybe(types.string),
  rPreimage: types.string,
  rHash: types.string,
  value: types.maybe(types.number), // for amountless invoices
  settled: types.maybe(types.boolean),
  state: types.maybe(types.number), // XXX FIXME
  creationDate: types.number,
  expiry: types.maybe(types.number),
  settleDate: types.maybe(types.number),
  paymentRequest: types.maybe(types.string),
  private: types.maybe(types.boolean),
  amtPaidSat: types.maybe(types.number),
  htlcs: types.array(HTLCModel),
  // under htlcs but not in array: mppTotalAmtMsat: types.maybe(types.string),

  // many other fields are not copied
})

export const PendingChannelModel = types.model("Channel", {
  // [
  //   "pendingChannels:",
  //   {
  //     "pendingOpenChannels": [
  //       {
  //         "channel": {
  //           "remoteNodePub": "029fd0834277b92b6ae1b4afd771f74a2f0e9bbdfc13edcf3e7e3da1590c6fc6d6",
  //           "channelPoint": "65ccfc3bf905c8c139e9c6fdf887e4c1bc53624cf13ce266ce2f1704b7a37732:1",
  //           "capacity": "120000",
  //           "remoteBalance": "119817",
  //           "localChanReserveSat": "1200",
  //           "remoteChanReserveSat": "1200"
  //         },
  //         "commitFee": "183",
  //         "commitWeight": "552",
  //         "feePerKw": "253"
  //       }
  //     ]
  //   }
  // ]

  // channel: types.model({
  remoteNodePub: types.string,
  channelPoint: types.string,
  capacity: types.number,
  remoteBalance: types.number,
  localChanReserveSat: types.number,
  remoteChanReserveSat: types.number,
  // }),
  // commitFee: types.number,
  // commitWeight: types.number,
  // feePerKw: types.number
})

export const PendingHTLCModel = types.model("PendingHTLC", {
  // TODO
})

export const ChannelModel = types.model("Channel", {
  active: types.maybe(types.boolean),
  remotePubkey: types.string,
  channelPoint: types.string,
  chanId: types.number,
  capacity: types.number,
  remoteBalance: types.number,
  localBalance: types.optional(types.number, 0),
  commitFee: types.number,
  commitWeight: types.number,
  feePerKw: types.number,
  totalSatoshisReceived: types.optional(types.number, 0),
  numUpdates: types.optional(types.number, 0),
  pendingHtlcs: types.optional(types.array(types.undefined), []),
  csvDelay: types.number,
  private: types.boolean,
  chanStatusFlags: types.string,
  localChanReserveSat: types.number,
  remoteChanReserveSat: types.number,
})

export const FiatTransactionModel = types.model("Transaction", {
  name: types.string,
  icon: types.string,
  amount: types.number,
  date: types.number, // TODO: move to timestamp
  cashback: types.maybe(types.number),
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
    get transactions(): Array<typeof TransactionModel> {
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

        const result = yield functions().httpsCallable("quoteLNDBTC")(request)
        console.tron.log("quoteBTC: ", result)
        self.quote = result.data as IQuoteResponse

        const invoiceJson = yield getParentOfType(self, DataStoreModel).lnd.decodePayReq(
          self.quote.invoice,
        )
        console.tron.log(invoiceJson)

        if (side === "sell") {
          self.quote.satPrice = parseFloat(JSON.parse(invoiceJson.description).satPrice)
        }

        self.quote.satAmount = invoiceJson.numSatoshis
        self.quote.validUntil = invoiceJson.timestamp + invoiceJson.expiry
      }),

      buyLNDBTC: flow(function* () {
        try {
          assertTrade("buy")

          const request: IBuyRequest = {
            side: self.quote.side!,
            invoice: self.quote.invoice!,
            satPrice: self.quote.satPrice!,
            signature: self.quote.signature!,
          }

          const result = yield functions().httpsCallable("buyLNDBTC")(request)
          console.tron.log("result BuyLNDBTC", result)
          return result?.data?.success ?? false
        } catch (err) {
          console.tron.error(err.toString())
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
          console.tron.error(err)
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
        const doc = yield firestore().doc(`users/${uid}`).get()
        self._transactions = doc.data().transactions
      } catch (err) {
        console.tron.error(`not able to update transaction ${err}`)
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
          console.tron.error(`can't fetch the balance ${err}`)
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
    version: "...loading...",

    lndReady: false,
    walletExist: false,
    syncedToChain: false,

    onChainAddress: "",
    pubkey: "",
    network: "",
    blockHeight: 0,
    error: "",

    lastAddInvoice: "",
    receiveBitcoinScreenAlert: false,

    bestBlockHeight: types.maybe(types.number),
    startBlockHeight: types.maybe(types.number),
    percentSynced: 0,

    pendingChannels: types.array(PendingChannelModel),
    channels: types.array(ChannelModel),

    onchain_transactions: types.array(OnChainTransactionModel),
    invoices: types.array(InvoiceModel),
    payments: types.array(PaymentModel),
  })
  .actions((self) => {
    return {
      setLndReady: flow(function* () {
        self.lndReady = true
      }),

      update: flow(function* () {
        yield self.updateBalance()
        yield self.updateTransactions()
        yield self.updateInvoices()
        yield self.listPayments()
      }),

      newAddress: flow(function* () {
      }),

      decodePayReq: flow(function* (payReq) {
        return yield getEnv(self).lnd.grpc.sendCommand("decodePayReq", {
          payReq,
        })
      }),

      addInvoice: flow(function* ({ value, memo }) {
        const { data } = yield functions().httpsCallable("addInvoice")({ value, memo })
        self.lastAddInvoice = data.request
      }),

      clearLastInvoice: flow(function* () {
        self.lastAddInvoice = ""
      }),

      resetReceiveBitcoinScreenAlert: flow(function* () {
        self.receiveBitcoinScreenAlert = false
      }),

      updateBalance: flow(function* () {
          // self.confirmedBalance = onChainBalance.confirmedBalance + channelBalance.balance
          // self.unconfirmedBalance =
          //   onChainBalance.unconfirmedBalance + channelBalance.pendingOpenBalance
      }),

      updateTransactions: flow(function* () {

      }),

      updateInvoice: flow(function* (invoice) {

      }),

      updateInvoices: flow(function* () {
      }),

      listPayments: flow(function* () {
      }),

      sendTransaction: flow(function* (addr, amount) {
        return yield getEnv(self).lnd.grpc.sendCommand("sendCoins", { addr, amount })
      }),

      // doesn't update the store, should this be here?
      payInvoice: flow(function* (paymentRequest) {
      }),
    }
  })
  .views((self) => ({
    get currency() {
      return CurrencyType.BTC
    },

    get transactions() {
      // TODO, optimize with some form of caching

      const onchainTxs = self.onchain_transactions.map((transaction) => ({
        id: transaction.txHash,
        name: transaction.amount > 0 ? "Received" : "Sent",
        icon: transaction.amount > 0 ? "ios-download" : "ios-exit",
        amount: transaction.amount,
        date: parseDate(transaction.timeStamp),
        status: transaction.numConfirmations < 3 ? "unconfirmed" : "confirmed",
      }))

      const formatInvoice = (invoice) => {
        if (invoice.settled) {
          if (invoice.memo) {
            return invoice.memo
          } else if (invoice.htlcs[0].customRecords) {
            return translateTitleFromItem(invoice.htlcs[0].customRecords)
          } else {
            return `Payment received`
          }
        } else {
          return `Waiting for payment`
        }
      }

      const formatPayment = (payment) => {
        if (payment.description) {
          try {
            const decode = JSON.parse(payment.description)
            return decode.memo
          } catch (e) {
            return payment.description
          }
        } else {
          return `Paid invoice ${shortenHash(payment.paymentHash, 2)}`
        }
      }

      const filterExpiredInvoice = (invoice) => {
        if (invoice.settled === true) {
          return true
        }
        if (new Date().getTime() / 1000 > invoice.creationDate + invoice.expiry) {
          return false
        }
        return true
      }

      const invoicesTxs = self.invoices.filter(filterExpiredInvoice).map((invoice) => ({
        id: invoice.rHash,
        icon: "ios-thunderstorm",
        name: formatInvoice(invoice),
        amount: invoice.value,
        status: invoice.settled ? "complete" : "in-progress",
        date: parseDate(invoice.creationDate),
        preimage: invoice.rPreimage,
        memo: invoice.memo,
      }))

      const paymentTxs = self.payments.map((payment) => ({
        id: payment.paymentHash,
        icon: "ios-thunderstorm",
        name: formatPayment(payment),
        // amount should be negative so that it's shown as "spent"
        amount: -payment.valueSat,
        date: parseDate(payment.creationDate),
        preimage: payment.paymentPreimage,
        status: "complete", // filter for succeed on ?
      }))

      const all_txs = [...onchainTxs, ...invoicesTxs, ...paymentTxs].sort((a, b) =>
        a.date > b.date ? 1 : -1,
      )
      return all_txs
    },
  }))

export const AccountModel = types.union(FiatAccountModel, LndModel)

export const RatesModel = types
  .model("Rates", {
    USD: 1, // TODO is there a way to have enum as parameter?
    BTC: 0.0001, // Satoshi to USD default value
  })
  .actions((self) => {
    const update = flow(function* () {
      try {
        const doc = yield firestore().doc("global/price").get()
        self.BTC = doc.data().BTC
      } catch (err) {
        console.tron.error("error getting BTC price from firestore", err)
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
      }
    },
  }))

interface BalanceRequest {
  currency: CurrencyType
  account: AccountType
}

// TODO move to utils?
const translateTitleFromItem = (item) => {
  console.tron.log({ item })
  const object = translate(`RewardsScreen.rewards`)
  for (const property in object) {
    for (const property2 in object[property]) {
      if (property2 === item) {
        return object[property][property2].title
      }
    }
  }
  return "Translation not found"
}

export const OnboardingModel = types
  .model("Onboarding", {
    type: AccountType.VirtualBitcoin,
    currency: CurrencyType.BTC,
    stage: types.array(types.enumeration<Onboarding>("Onboarding", Object.values(Onboarding))),
  })
  .actions((self) => ({
    add: flow(function* (step) {
      if (self.stage.findIndex((item) => item == step) === -1) {
        self.stage.push(step)
      }
    }),

    // dummy function to have same interface with bitcoin wallet and bank account
    update: flow(function* () {}),

    // for debug when resetting account
    _reset: flow(function* () {
      while (self.stage.length > 0) {
        self.stage.pop()
      }
    }),
  }))
  .views((self) => ({
    // TODO using: BalanceRequest type, how to set it?
    has(step: Onboarding) {
      // TODO exception
      // --> notifications
      // --> phoneAuth

      return self.stage.findIndex((item) => item == step) !== -1
    },

    get balance() {
      const rewards = self.stage.map((item) => OnboardingRewards[item])
      if (rewards.length > 0) {
        return rewards.reduce((acc, curr) => acc + curr)
      } else {
        return 0
      }
    },

    get rewardsAvailable() {
      return difference(Object.values(Onboarding), self.stage).length
    },

    get transactions() {
      const txs = self.stage.map((item) => ({
        // TODO: interface for those pending transactions
        name: translateTitleFromItem(item),
        icon: "ios-exit",
        amount: OnboardingRewards[item],
        date: Date.now(),
      }))

      console.tron.log({ txs })
      return txs
    },
  }))

export const DataStoreModel = types
  .model("DataStore", {
    onboarding: types.optional(OnboardingModel, {}),
    fiat: types.optional(FiatAccountModel, {}),
    rates: types.optional(RatesModel, {}),
    exchange: types.optional(ExchangeModel, {}),
    lnd: types.optional(LndModel, {}), // TODO should it be optional?
  })
  .actions((self) => ({
    updateBalance: flow(function* () {
      yield Promise.all([
        yield self.rates.update(),
        yield self.fiat.updateBalance(),
        yield self.lnd.updateBalance(),
      ])
    }),
  }))
  .views((self) => ({
    // TODO using: BalanceRequest type, how to set it?
    balances({ currency, account }) {
      const balances = {}

      const btcConversion = self.rates.rate(self.lnd.currency) / self.rates.rate(currency)

      balances[AccountType.Bitcoin] = self.lnd.balance * btcConversion
      balances[AccountType.VirtualBitcoin] = self.onboarding.balance * btcConversion
      balances[AccountType.Bank] = self.fiat.balance / self.rates.rate(currency)
      balances[AccountType.BankAndVirtualBitcoin] =
        balances[AccountType.Bank] + balances[AccountType.Bitcoin]
      balances[AccountType.BankAndBitcoin] =
        balances[AccountType.Bank] + balances[AccountType.VirtualBitcoin]

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
export interface DataStore extends DataStoreType {}

type DataStoreSnapshotType = SnapshotOut<typeof DataStoreModel>
export interface DataStoreSnapshot extends DataStoreSnapshotType {}

export type LndStore = Instance<typeof LndModel>

type FiatAccountType = Instance<typeof FiatAccountModel>
export interface FiatAccount extends FiatAccountType {}

// type CryptoAccountType = Instance<typeof LndModel> // FIXME is that still accurate?
// export interface CryptoAccount extends CryptoAccountType {}

type RatesType = Instance<typeof RatesModel>
export interface Rates extends RatesType {}
