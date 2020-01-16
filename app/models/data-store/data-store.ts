import { Instance, SnapshotOut, types, flow, getParentOfType, getEnv } from "mobx-state-tree"
import { AccountType, CurrencyType, PendingOpenChannelsStatus } from "../../utils/enum"
import { parseDate } from "../../utils/date"
import KeychainAction from "../../utils/keychain"
import { generateSecureRandom } from "react-native-securerandom"

import auth from "@react-native-firebase/auth"
import functions from "@react-native-firebase/functions"
import firestore from "@react-native-firebase/firestore"
import { toHex } from "../../utils/helper"

import DeviceInfo from "react-native-device-info"
import Config from "react-native-config"

// // FIXME add as a global var
DeviceInfo.isEmulator().then(isEmulator => {
  if (isEmulator) {
    functions().useFunctionsEmulator("http://localhost:5000")
}})

export const OnChainTransactionModel = types.model("OnChainTransaction", {
  txHash: types.string,
  amount: types.number,
  numConfirmations: types.maybe(types.number), // not sure why it's only set for some of them
  blockHash: types.maybe(types.string), // some mined transactions are not
  blockHeight: types.maybe(types.number), // included here
  timeStamp: types.number,
  destAddresses: types.array(types.string),
  totalFees: types.maybe(types.string), //only set for sending transaction
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
})

export const InvoiceModel = types.model("Invoice", {
  memo: types.string,
  receipt: types.maybe(types.string),
  rPreimage: types.string,
  rHash: types.string,
  value: types.number,
  settled: types.boolean,
  state: types.number, //XXX FIXME
  creationDate: types.number,
  expiry: types.number,
  settleDate: types.number,
  paymentRequest: types.string,
  private: types.boolean,
  amtPaidSat: types.number,
  // many other fields are not copied
})

export const FiatTransactionModel = types.model("Transaction", {
  name: types.string,
  icon: types.string,
  amount: types.number,
  date: types.Date,
  cashback: types.maybe(types.number),
})

export const TransactionModel = types.model("Transaction", {
  name: types.string,
  icon: types.string,
  amount: types.number,
  date: types.Date,
  cashback: types.maybe(types.number),
})

export const BaseAccountModel = types
  .model("Account", {
    confirmedBalance: 0,
    unconfirmedBalance: 0,
    type: types.enumeration<AccountType>("Account Type", Object.values(AccountType)),
  })
  .views(self => ({
    get balance() {
      return self.confirmedBalance + self.unconfirmedBalance
    },
    get transactions(): Array<typeof TransactionModel> {
      throw new Error("this is an abstract method, need to be implemented in subclass")
    },
  }))

export const QuoteModel = types
  .model("Quote", {
    satAmount: 0,
    satPrice: 0,
    validUntil: Date.now(),
    signature: "",
    side: "", // enum "buy", "sell"
    address: "", // only for sell, when wallet needs to send funds
  })
  .actions(self => ({
    reset() {
      // TODO there must be better way to do this
      self.satAmount = self.satPrice = self.validUntil = 0
      self.signature = self.side = self.address = ""
    },
  }))

export const ExchangeModel = types
  .model("Exchange", {
    quote: types.optional(QuoteModel, {}),
  })
  .actions(self => {
    const quoteBTC = flow(function*(side: "buy" | "sell", satAmount = 1000) {
      try {
        const result = yield functions().httpsCallable("quoteBTC")({ side, satAmount })
        console.tron.log("quoteBTC: ", result)
        self.quote = result.data()
      } catch (err) {
        console.tron.error("quoteBTC: ", err)
        throw err
      }
    })

    const commonBuySell = (side: string): boolean /* success */ => {
      if (self.quote.side !== side) {
        console.tron.log(`not a quote to ${side}`)
        return false
      }

      const now = Date.now()
      if (now > self.quote.validUntil) {
        // TODO ask back for a new quote
        console.tron.log(`quote ${self.quote.validUntil} has expired, now is ${now}`)
        return false
      }

      return true
    }

    const buyBTC = flow(function*() {
      try {
        if (!commonBuySell("buy")) {
          return
        }

        const result = yield functions().httpsCallable("buyBTC")({
          quote: { ...self.quote },

          // TODO: wallet should be opened
          btcAddress: getParentOfType(self, DataStoreModel).lnd.onChainAddress,
        })
        console.tron.log("result BuyBTC", result)
      } catch (err) {
        console.tron.error(err)
        throw err
      }

      self.quote.reset()
    })

    const sellBTC = flow(function*() {
      try {
        if (!commonBuySell("sell")) {
          return
        }

        // TODO: may be relevant to check signature
        // to make sure address is from Galoy?

        const { txid } = yield getParentOfType(self, DataStoreModel).lnd.sendTransaction(
          self.quote.address,
          self.quote.satAmount,
        )

        console.tron.log(txid)

        // TODO : make sure to manage error here,
        // eg: if the the on chain transaction is send by sellBTC
        // is never called from the mobile application
        // this could be done in the backend

        const result = yield functions().httpsCallable("sellBTC")({
          quote: { ...self.quote },
          onchain_tx: txid,
        })
        console.tron.log("result SellBTC", result)
      } catch (err) {
        console.tron.error(err)
        throw err
      }

      self.quote.reset()
    })

    return { quoteBTC, buyBTC, sellBTC }
  })

export const FiatAccountModel = BaseAccountModel.props({
  type: AccountType.Checking,
  _transactions: types.array(FiatTransactionModel),
})
  .actions(self => {
    const updateTransactions = flow(function*() {
      let uid
      try {
        uid = auth().currentUser.uid
      } catch (err) {
        console.tron.log("can't get auth().currentUser.uid", err)
      }
      try {
        // TODO: automatic fetch update if collected is being updated.
        const doc = yield firestore()
          .doc(`users/${uid}`)
          .get()
        self._transactions = doc.data().transactions
      } catch (err) {
        console.tron.error(`not able to update transaction ${err}`)
      }
    })

    const updateBalance = flow(function*() {
      try {
        const result = yield functions().httpsCallable("getFiatBalances")({})
        console.tron.log("balance", result)
        if ("data" in result) {
          self.confirmedBalance = result.data
          // TODO: add unconfirmed balance
        }
      } catch (err) {
        console.tron.error(`can't fetch the balance`, err)
      }
    })
    const update = flow(function*() {
      yield updateBalance()
      yield updateTransactions()
    })

    return { updateBalance, updateTransactions, update }
  })
  .views(self => ({
    get currency() {
      return CurrencyType.USD
    },
    get transactions() {
      return self._transactions
    },
  }))

export const LndModel = BaseAccountModel.named("Lnd")
  .props({
    type: AccountType.Bitcoin,
    version: "...loading...",
    
    walletExist: false,
    walletUnlocked: false,
    syncedToChain: false,

    onChainAddress: "",
    pubkey: "",
    network: "",
    blockHeight: 0,

    lastSettleInvoiceHash: "",

    bestBlockHeight: types.maybe(types.number),
    startBlockHeight: types.maybe(types.number),
    percentSynced: 0,

    onchain_transactions: types.array(OnChainTransactionModel),
    invoices: types.array(InvoiceModel),
    payments: types.array(PaymentModel),
  })
  .actions(self => {
    // stateless, but must be an action instead of a view because of the async call
    const initState = flow(function*() {
      const WALLET_EXIST = "rpc error: code = Unknown desc = wallet already exists"
      const CLOSED = "Closed"
      let walletExist = false
      try {
        yield getEnv(self).lnd.grpc.sendUnlockerCommand("GenSeed")
      } catch (err) {
        console.tron.log("wallet exist", err)
        if (err.message === WALLET_EXIST) {
          walletExist = true
        }
        if (err.message === CLOSED) {
          // We assumed that if sendUnlockerCommand is locked, the node is already launched.
          // FIXME validate this assumption
          walletExist = true
          walletGotOpened()
        }
      }

      self.walletExist = walletExist
    })

    const genSeed = flow(function*() {
      if (self.walletExist) {
        // TODO be able to recreate the wallet
        console.tron.warning(`genSeed: can't create a new wallet when one already exist`)
        return
      }

      try {
        const seed = yield getEnv(self).lnd.grpc.sendUnlockerCommand("GenSeed")
        console.tron.log("seed", seed.cipherSeedMnemonic)
        yield new KeychainAction().setItem("seed", seed.cipherSeedMnemonic.join(" "))
      } catch (err) {
        console.tron.error(err)
      }
    })

    const initWallet = flow(function*() {
      if (self.walletExist) {
        // TODO be able to recreate the wallet
        console.tron.warning(`initWallet: can't create a new wallet when one already exist`)
        return
      }

      const random_number = yield generateSecureRandom(24)
      const wallet_password = toHex(random_number)

      try {
        yield getEnv(self).lnd.grpc.sendUnlockerCommand("InitWallet", {
          walletPassword: Buffer.from(wallet_password, "hex"),
          cipherSeedMnemonic: (yield new KeychainAction().getItem("seed")).split(" "),
        })

        yield new KeychainAction().setItem("password", wallet_password)

        self.walletExist = true
        yield walletGotOpened()
      } catch (err) {
        console.tron.error(err)
      }
    })

    // TODO: triggered this automatically after the wallet is being unlocked
    const sendPubKey = flow(function*() {
      try {
        const result = yield functions().httpsCallable("sendPubKey")({
          pubkey: self.pubkey,
          network: self.network,
        })
        console.tron.log("sendpubKey", result)
      } catch (err) {
        console.tron.err(`can't send pubKey`, err)
      }
    })

    const connectGaloyPeer = flow(function*() {
      if (!self.syncedToChain) {
        console.tron.warn("needs to be synced to chain before connecting to a peer")
        return
      }

      try {
        var doc = yield firestore()
          .doc(`global/info`)
          .get()
      } catch (err) {
        console.tron.err(`can't get Galoy node info`, err)
        return
      }

      let { pubkey, host } = doc.data().lightning
      // if (isSimulator()) { host = "127.0.0.1" }
      console.tron.log(`connecting to:`, { pubkey, host })

      try {
        const connection = yield getEnv(self).lnd.grpc.sendCommand("connectPeer", {
          addr: { pubkey, host },
        })

        console.log(connection)
      } catch (err) {
        console.tron.warn(`can't connect to peer`, err)
      }
    })

    const listPeers = flow(function*() {
      try {
        const result = yield getEnv(self).lnd.grpc.sendCommand("listPeers")
        console.tron.log("listPeers:", result)
      } catch (err) {
        console.tron.error(err)
      }
    })

    const pendingChannels = flow(function*() {
      try {
        const result = yield getEnv(self).lnd.grpc.sendCommand("pendingChannels")
        console.tron.log("pendingChannels:", result)
        return result
      } catch (err) {
        console.tron.error(err)
        throw err
      }
    })

    const listChannels = flow(function*() {
      try {
        const result = yield getEnv(self).lnd.grpc.sendCommand("listChannels")
        console.tron.log("listChannels:", result)
        return result
      } catch (err) {
        console.tron.error(err)
        throw err
      }
    })

    const statusFirstChannelOpen = flow(function*() {
      const { pendingOpenChannels } = yield pendingChannels()
      const { channels } = yield listChannels()

      let result
      // TODO be more throrough, eg check that the other pub key
      if (channels.length > 0) {
        result = PendingOpenChannelsStatus.opened
      } else if (pendingOpenChannels.length > 0) {
        result = PendingOpenChannelsStatus.pending
      } else {
        result = PendingOpenChannelsStatus.noChannel
      }

      console.tron.log("statusFirstChannelOpen", result)
      return result
    })

    const openChannel = flow(function*() {
      try {
        const result = yield functions().httpsCallable("openChannel")({})
        console.tron.log("opening a channel with Galoy node", result)
        return result
      } catch (err) {
        console.tron.error(`impossible to open a channel ${err}`)
        throw err
      }
    })

    /**
     * An internal helper function to approximate the current progress while
     * syncing Neutrino to the full node.
     * @param  {Object} grpcInput The getInfo's grpc api response
     * @return {number}          The percrentage a number between 0 and 1
     */
    const calcPercentSynced = grpcInput => {
      let response

      if (self.bestBlockHeight === undefined || self.startBlockHeight == undefined) {
        response = 0
      } else if (self.bestBlockHeight! <= self.startBlockHeight!) {
        response = 1
      } else {
        const percentSync =
          (grpcInput.blockHeight - self.startBlockHeight!) /
          (self.bestBlockHeight! - self.startBlockHeight!)
        response = +percentSync.toFixed(3)
      }

      if (response > 1) {
        response = 1
      }
      if (response < 0) {
        response = 0
      }
      if (isNaN(response)) {
        console.tron.log(`reponse is NaN, 
          self.bestBlockHeight ${self.bestBlockHeight}
          self.startBlockHeight ${self.startBlockHeight}
          grpc_input.blockHeight ${grpcInput.blockHeight}          
          `)
        response = 0
      }

      return response
    }

    const getInfo = flow(function*() {
      try {
        const response = yield getEnv(self).lnd.grpc.sendCommand("getInfo")
        self.version = response.version.split(" ")[0]
        self.pubkey = response.identityPubkey
        self.syncedToChain = response.syncedToChain
        self.blockHeight = response.blockHeight
        self.network = response.chains[0].network

        if (self.startBlockHeight === undefined) {
          self.startBlockHeight = response.blockHeight

          try {

            let url

            if (Config.BITCOIN_NETWORK === "testnet") {
              url = "http://api.blockcypher.com/v1/btc/test3"
            } else if (Config.BITCOIN_NETWORK === "mainnet") {
              url = "https://api.blockcypher.com/v1/btc/main"
            } else {
              throw new Error('config issue')
            }

            const response = yield fetch(url) // FIXME find a better solution
            const { height } = yield response.json()
            self.bestBlockHeight = height
          } catch (err) {
            console.warn(`can't fetch blockcypher`, err)
          }
        }

        if (!response.syncedToChain) {
          //     self._notification.display({
          //       msg: `Syncing to chain (block: ${response.blockHeight})`,
          //       wait: true,
          //     });
        } else {
          // this._store.settings.restoring = false;
          // this._notification.display({
          //   type: 'success',
          //   msg: 'Syncing complete',
          // });
          console.tron.log("Syncing complete")
        }

        self.percentSynced = calcPercentSynced(response)
        return response.syncedToChain
      } catch (err) {
        console.tron.error(`Getting node info failed, ${err}`)
        throw err
      }
    })

    const update = flow(function*() {
      yield updateBalance()
      yield updateTransactions()
      yield updateInvoices()
      yield listPayments()
    })

    // this get triggered after the wallet is being unlocked
    const walletGotOpened = flow(function*() {
      self.walletUnlocked = true
      yield getInfo()
      yield update()
    })


    const unlockWallet = flow(function*() {
      // TODO: auth with biometrics/passcode
      const wallet_password = yield new KeychainAction().getItem("password")

      try {
        yield getEnv(self).lnd.grpc.sendUnlockerCommand("UnlockWallet", {
          walletPassword: Buffer.from(wallet_password, "hex"),
        })

        yield walletGotOpened()
      } catch (err) {
        console.tron.error(err)
      }
    })

    const newAddress = flow(function*() {
      const { address } = yield getEnv(self).lnd.grpc.sendCommand("NewAddress", { type: 0 })
      self.onChainAddress = address
      console.tron.log(address)
    })

    const decodePayReq = flow(function*(payReq) {
      return yield getEnv(self).lnd.grpc.sendCommand("decodePayReq", { 
        payReq,
    })})

    const addInvoice = flow(function*({ value, memo }) {
      const response = yield getEnv(self).lnd.grpc.sendCommand("addInvoice", {
        value,
        memo,
        expiry: 172800, // 48 hours
        private: true,
      })

      return response
    })

    const updateBalance = flow(function*() {
      try {
        const onChainBalance = yield getEnv(self).lnd.grpc.sendCommand("WalletBalance")
        const channelBalance = yield getEnv(self).lnd.grpc.sendCommand("ChannelBalance")
        self.confirmedBalance = onChainBalance.confirmedBalance + channelBalance.balance
        self.unconfirmedBalance =
          onChainBalance.unconfirmedBalance + channelBalance.pendingOpenBalance

        return self.balance
      } catch (err) {
        console.tron.error(`Getting wallet balance failed ${err}`)
        throw err
      }
    })

    const updateTransactions = flow(function*() {
      try {
        const { transactions } = yield getEnv(self).lnd.grpc.sendCommand("getTransactions")

        // for some reason, amount and timestamp arrives as String
        // doing this map fixes the issue,
        // XXX FIXME: find the root cause of this type issue
        const transaction_good_types = transactions.map(tx => ({
          txHash: tx.txHash,
          numConfirmations: tx.numConfirmations,
          amount: tx.amount,
          blockHash: tx.blockHash,
          blockHeight: tx.blockHeight,
          timeStamp: tx.timeStamp,
          rawTxHex: tx.rawTxHex,
          destAddresses: tx.destAddresses,
        }))

        console.tron.log("onchain_transactions", transactions, transaction_good_types)

        self.onchain_transactions = transaction_good_types
      } catch (err) {
        console.tron.error(`Listing transactions failed ${err}`)
        throw err
      }
    })

    const updateInvoice = flow(function*(invoice) {
      if (invoice === undefined) return
      if (!invoice.settled) return

      console.tron.warn(invoice)

      self.lastSettleInvoiceHash = toHex(invoice.rHash)
      // const { computedTransactions, unitLabel } = this._store
      // let inv = computedTransactions.find(tx => tx.id === toHex(invoice.rHash))
      // this._notification.display({
      //   type: 'success',
      //   msg: `Invoice success: received ${inv.amountLabel} ${unitLabel || ''}`,
      //   handler: () => this.select({ item: inv }),
      //   handlerLbl: 'View details',
      // })
    })

    const updateInvoices = flow(function*() {
      try {
        const { invoices } = yield getEnv(self).lnd.grpc.sendCommand("listInvoices")

        // for some reason, amount and timestamp arrives as String
        // doing this map fixes the issue,
        // XXX FIXME: find the root cause of this type issue
        const invoices_good_types = invoices.map(tx => ({
          memo: tx.memo,
          receipt: toHex(tx.receipt), // do we want this? receipt are empty
          rPreimage: toHex(tx.rPreimage),
          rHash: toHex(tx.rHash),
          value: tx.value,
          settled: tx.settled,
          state: tx.state, // XXX FIXME is converted to number?
          creationDate: tx.creationDate,
          settleDate: tx.settleDate,
          paymentRequest: tx.paymentRequest,
          private: tx.private,
          amtPaidSat: tx.amtPaidSat,
          expiry: tx.expiry,
        }))

        console.tron.log("invoices", invoices, invoices_good_types)

        self.invoices = invoices_good_types
      } catch (err) {
        console.tron.error(`Listing invoices failed ${err}`)
        // throw err
      }
    })

    const listPayments = flow(function*() {
      try {
        const { payments } = yield getEnv(self).lnd.grpc.sendCommand("listPayments")!

        // for some reason, amount and timestamp arrives as String
        // doing this map fixes the issue,
        // XXX FIXME: find the root cause of this type issue
        const payments_good_types = payments.map(tx => ({
          paymentHash: tx.paymentHash,
          creationDate: tx.creationDate,
          path: tx.path,
          paymentPreimage: tx.paymentPreimage,
          valueSat: tx.valueSat,
          paymentRequest: tx.paymentRequest,
          status: tx.status, // XXX FIXME status is being converted from "Succeed" to 2?
        }))

        console.tron.log("payments", payments, payments_good_types)

        self.payments = payments_good_types
      } catch (err) {
        console.tron.error(`Listing payments failed ${err}`)
        // throw err
      }
    })

    const sendTransaction = flow(function*(addr, amount) {
      return yield getEnv(self).lnd.grpc.sendCommand("sendCoins", { addr, amount })
    })

    // doesn't update the store, should this be here?
    const payInvoice = flow(function*(paymentRequest) {
      const PAYMENT_TIMEOUT = 10000 // how long is this?

      let success = true
      const timeout = setTimeout(() => {
        success = false
        // TODO: do something to show payment failed
      }, PAYMENT_TIMEOUT)

      try {
        const stream = getEnv(self).lnd.grpc.sendStreamCommand("sendPayment")

        yield new Promise((resolve, reject) => {
          stream.on("data", data => {
            if (data.paymentError) {
              reject(new Error(`Lightning payment error: ${data.paymentError}`))
            } else {
              resolve()
            }
          })
          stream.on("error", reject)
          stream.write(JSON.stringify(paymentRequest), "utf8")
        })

        return success
      } catch (err) {
        console.tron.error(err)
        return err

        // this._nav.goPayLightningConfirm();
        // this._notification.display({ msg: 'Lightning payment failed!', err });
      } finally {
        clearTimeout(timeout)
      }
    })

    return {
      initState,
      genSeed,
      initWallet,
      unlockWallet,
      sendPubKey,
      listPeers,
      listChannels,
      pendingChannels,
      statusFirstChannelOpen,
      getInfo,
      decodePayReq,
      addInvoice,
      connectGaloyPeer,
      openChannel,
      walletGotOpened,
      newAddress,
      updateTransactions,
      updateBalance,
      updateInvoice,
      updateInvoices,
      update,
      payInvoice,
      listPayments,
      sendTransaction,
    }
  })
  .views(self => ({
    get currency() {
      return CurrencyType.BTC
    },

    get transactions() {
      // TODO, optimize with some form of caching

      const onchainTxs = self.onchain_transactions.map(transaction => ({
        id: transaction.txHash,
        name: transaction.amount > 0 ? "Received" : "Sent",
        icon: transaction.amount > 0 ? "ios-download" : "ios-exit",
        amount: transaction.amount,
        date: parseDate(transaction.timeStamp),
        status: transaction.numConfirmations < 3 ? "unconfirmed" : "confirmed",
      }))

      const formatName = invoice => {
        if (invoice.settled) {
          if (invoice.memo) {
            return invoice.memo
          } else {
            return `Payment received`
          }
        } else {
          return `Waiting for payment`
        }
      }

      const filterExpiredInvoice = (invoice => {
        if (invoice.settled === true) {
          return true
        }
        if (new Date().getTime() / 1000 > invoice.creationDate + invoice.expiry) {
          return false
        } 
        return true
      })

      const invoicesTxs = self.invoices
          .filter(filterExpiredInvoice)
          .map(invoice => ({
        id: invoice.rHash,
        icon: "ios-thunderstorm",
        name: formatName(invoice),
        amount: invoice.value,
        status: invoice.settled ? "complete" : "in-progress",
        date: parseDate(invoice.creationDate),
        memo: invoice.memo,
      }))

      const paymentTxs = self.payments.map(payment => ({
        id: payment.paymentHash,
        icon: "ios-thunderstorm",
        name: `Paid invoice ${payment.paymentHash.slice(0, 7)}...${payment.paymentHash.slice(-8)}`,
        amount: payment.valueSat,
        date: parseDate(payment.creationDate),
        status: "complete", //filter for succeed on ?
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
  .actions(self => {
    const update = flow(function*() {
      try {
        const doc = yield firestore()
          .doc("global/price")
          .get()
        self.BTC = doc.data().BTC
      } catch (err) {
        console.tron.error("error getting BTC price from firestore", err)
      }
    })
    return { update }
  })
  .views(self => ({
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

export const DataStoreModel = types
  .model("DataStore", {
    fiat: types.optional(FiatAccountModel, {}),
    rates: types.optional(RatesModel, {}),
    exchange: types.optional(ExchangeModel, {}),
    lnd: types.optional(LndModel, {}), // TODO should it be optional?
  })
  .actions(self => {
    const updateTransactions = flow(function*() {
      // TODO parrallel call?
      yield self.fiat.updateTransactions()
      yield self.lnd.updateTransactions()
    })

    const updateBalance = flow(function*() {
      // TODO parrallel call?
      yield self.rates.update()
      yield self.fiat.updateBalance()
      yield self.lnd.updateBalance()
    })

    return { updateTransactions, updateBalance }
  })
  .views(self => ({
    // TODO using: BalanceRequest type, how to set it?
    balances({ currency, account }) {
      const balances = {}

      balances[AccountType.Bitcoin] =
        (self.lnd.balance * (self.rates.rate(self.lnd.currency)) / self.rates.rate(currency))
      balances[AccountType.Checking] = self.fiat.balance / self.rates.rate(currency)
      balances[AccountType.All] = Object.values(balances).reduce((a, b) => a + b, 0)

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
