import { Instance, SnapshotOut, types, flow, getParentOfType, getEnv } from "mobx-state-tree"
import { CurrencyType } from "./CurrencyType"
import { AccountType } from "../../screens/accounts-screen/AccountType"
import { parseDate } from "../../utils/date"
import KeychainAction from "../../utils/keychain"
import { generateSecureRandom } from 'react-native-securerandom'

import functions from '@react-native-firebase/functions'
import firestore from '@react-native-firebase/firestore'
import { toHex } from "../../utils/helper"

import DeviceInfo from 'react-native-device-info'

// FIXME add as a global var
const isSimulator = () => DeviceInfo.isEmulatorSync()

if (isSimulator()) {
  functions().useFunctionsEmulator('http://localhost:5000')
}

export const AuthModel = types
  .model("Auth", {
    email: "nicolas.burtey+default@gmail.com",
    isAnonymous: false,
    uid: "",
    emailVerified: false
  })
  .actions(self => {
    const set = (email: string, emailVerified: boolean, isAnonymous: boolean, uid: string) => {
      self.email = email
      self.emailVerified = emailVerified
      self.isAnonymous = isAnonymous
      self.uid = uid
    }

    const setEmail = (email: string) => {
      self.email = email
    }

    return { set, setEmail }
  })

// FIXME merge with TransactionModel?
export const PaymentModel = types
  .model("Payment", {
    id: types.string,
    type: types.string,
    amount: types.number,
    status: types.string,
    date: types.Date,
    fee: types.number,
    preimage: types.string, // or number?
    paymentRequest: types.string
    // no memo?
  })

// FIXME merge with TransactionModel?
export const InvoiceModel = types
  .model("Invoice", {
    id: types.string,
    type: types.string,
    amount: types.number,
    status: types.string,
    date: types.Date,
    memo: types.string,
  })

export const TransactionModel = types
  .model("Transaction", {
    name: types.string,
    icon: types.string,
    amount: types.number,
    date: types.Date,
    cashback: types.maybe(types.number),
    addr: types.maybe(types.string), // TODO derived 2 types of transactions for fiat/crytpo?
    // TODO add status
  })

export const BaseAccountModel = types
  .model("Account", {
    transactions: types.array(TransactionModel),
    confirmedBalance: 0,
    unconfirmedBalance: 0,
    type: types.enumeration<AccountType>("Account Type", Object.values(AccountType))
  })
  .views(self => ({
    get balance() {
      return self.confirmedBalance + self.unconfirmedBalance
    },
  }))

export const QuoteModel = types
  .model("Quote", {
    satAmount: 0,
    satPrice: 0,
    validUntil: Date.now(),
    signature: "",
    side: "", // enum "buy", "sell"
    address: "" // only for sell, when wallet needs to send funds
  }).actions(self => ({
    reset() { // TODO there must be better way to do this
      self.satAmount = self.satPrice = self.validUntil = 0
      self.signature = self.side = self.address = ""
    },
  }))

export const ExchangeModel = types
  .model("Exchange", {
    quote: types.optional(QuoteModel, {}),
  })
  .actions(self => {
    const quoteBTC = flow(function * (side: "buy" | "sell", satAmount = 1000) {
      try {
        const result = yield functions().httpsCallable('quoteBTC')({ side, satAmount })
        console.tron.log('result quoteBTC', result)
        self.quote = result.data
      } catch (err) {
        console.tron.error('quoteBTC: ', err)
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

    const buyBTC = flow(function * () {
      try {
        if (!commonBuySell('buy')) { return }

        const result = yield functions().httpsCallable('buyBTC')({
          quote: { ...self.quote },

          // TODO: wallet should be opened
          btcAddress: getParentOfType(self, DataStoreModel).lnd.onChainAddress,
        })
        console.tron.log('result BuyBTC', result)
      } catch (err) {
        console.tron.error(err)
        throw err
      }

      self.quote.reset()
    })

    const sellBTC = flow(function * () {
      try {
        if (!commonBuySell('sell')) { return }

        // TODO: may be relevant to check signature
        // to make sure address is from Galoy?

        const { txid } = yield getParentOfType(self, DataStoreModel)
          .lnd.send_transaction(self.quote.address, self.quote.satAmount)

        console.tron.log(txid)

        // TODO : make sure to manage error here,
        // eg: if the the on chain transaction is send by sellBTC
        // is never called.
        // this could be done in the backend

        const result = yield functions().httpsCallable('sellBTC')({
          quote: { ...self.quote },
          onchain_tx: txid,
        })
        console.tron.log('result SellBTC', result)
      } catch (err) {
        console.tron.error(err)
        throw err
      }

      self.quote.reset()
    })

    return { quoteBTC, buyBTC, sellBTC }
  })

export const FiatAccountModel = BaseAccountModel
  .props({
    type: AccountType.Checking,
  })
  .actions(self => {
    const update_transactions = flow(function * () {
      const uid = getParentOfType(self, DataStoreModel).auth.uid
      try {
        const doc = yield firestore().collection('users').doc(uid).get()
        self.transactions = doc.data().transactions // TODO better error management
      } catch (err) {
        console.tron.warn(err)
      }
    })

    const update_balance = flow(function * () {
      try {
        const result = yield functions().httpsCallable('getFiatBalances')({})
        console.tron.log('balance', result)
        if ("data" in result) {
          self.confirmedBalance = result.data
          // TODO: add unconfirmed balance
        }
      } catch (err) {
        console.tron.log(err)
      }
    })

    const reset = () => { // TODO test
      self.transactions.length = 0,
      self.confirmedBalance = 0
    }

    return { update_balance, reset, update_transactions }
  })
  .views(self => ({
    get currency() {
      return CurrencyType.USD
    },
  }))

export const LndModel = BaseAccountModel
  .named("Lnd")
  .props({
    walletExist: false,
    walletUnlocked: false,
    onChainAddress: "",
    type: AccountType.Bitcoin,
    pubkey: "",
    network: "",
    syncedToChain: false,
    blockHeight: 0,
    startingSyncTimestamp: types.maybe(types.number),
    percentSynced: 0,
    pendingInvoice: "",
    invoices: types.array(InvoiceModel), // FIXME merge with transactions?
    payments: types.array(PaymentModel), // FIXME merge with transactions?
  })
  .actions(self => {
    // stateless, but must be an action instead of a view because of the async call
    const initState = flow(function * () {
      const WALLET_EXIST = "rpc error: code = Unknown desc = wallet already exists"
      const CLOSED = "Closed"
      let walletExist = false
      try {
        yield getEnv(self).lnd.grpc.sendUnlockerCommand('GenSeed')
      } catch (err) {
        console.tron.log('wallet exist', err)
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

    const genSeed = flow(function * () {
      try {
        const seed = yield getEnv(self).lnd.grpc.sendUnlockerCommand('GenSeed')
        console.tron.log("seed", seed.cipherSeedMnemonic)
        yield new KeychainAction().setItem('seed', seed.cipherSeedMnemonic.join(" "))
      } catch (err) {
        console.tron.error(err)
      }
    })

    const initWallet = flow(function * () {
      const random_number = yield generateSecureRandom(24)
      const wallet_password = toHex(random_number)

      try {
        yield getEnv(self).lnd.grpc.sendUnlockerCommand('InitWallet', {
          walletPassword: Buffer.from(wallet_password, 'hex'),
          cipherSeedMnemonic: (yield new KeychainAction().getItem('seed')).split(" "),
        })

        yield new KeychainAction().setItem('password', wallet_password)

        self.walletUnlocked = true
        self.walletExist = true
      } catch (err) {
        console.tron.error(err)
      }
    })

    // TODO: triggered this automatically after the wallet is being unlocked
    const sendPubKey = flow(function * () {
      // TODO error management
      const result = yield functions().httpsCallable('onUserWalletCreation')({ pubkey: self.pubkey, network: self.network })
      console.log(result)
    })

    const connectGaloyPeer = flow(function * () {
      let uri

      if (!self.syncedToChain) {
        console.tron.warn('needs to be synced to chain before opening a channel')
        return
      }

      try {
        const doc = yield firestore().doc(`global/info`).get()
        uri = doc.data().lightning.uris[0]
      } catch (err) {
        console.tron.err(`can't get Galoy node uris`, err)
        return
      }

      let [pubkey, host] = uri.split("@")
      host = "127.0.0.1" // FIXME
      console.tron.log(`connecting to:`, { uri, pubkey, host })

      try {
        const connection = yield getEnv(self).lnd.grpc.sendCommand('connectPeer', {
          addr: { pubkey, host },
        })

        console.log(connection)
      } catch (err) {
        console.tron.warn(`can't connect to peer`, err)
      }
    })

    const listPeers = flow(function * () {
      try {
        const result = yield getEnv(self).lnd.grpc.sendCommand('listPeers')
        console.tron.log(result)
      } catch (err) {
        console.tron.error(err)
      }
    })

    const openChannel = flow(function * () {
      // TODO error management
      const result = yield functions().httpsCallable('openChannel')({})
      console.log(result)
    })

    /**
         * An internal helper function to approximate the current progress while
         * syncing Neutrino to the full node.
         * @param  {Object} response The getInfo's grpc api response
         * @return {number}          The percrentage a number between 0 and 1
         */
    const calcPercentSynced = (response) => {
      const bestHeaderTimestamp = response.bestHeaderTimestamp
      const currTimestamp = new Date().getTime() / 1000
      const progressSoFar = bestHeaderTimestamp
        ? bestHeaderTimestamp - self.startingSyncTimestamp
        : 0
      const totalProgress = currTimestamp - self.startingSyncTimestamp || 0.001
      const percentSynced = (progressSoFar * 1.0) / totalProgress
      return percentSynced
    }

    const getInfo = flow(function * () {
      console.tron.log('get info called')
      try {
        const response = yield getEnv(self).lnd.grpc.sendCommand('getInfo')
        self.pubkey = response.identityPubkey
        self.syncedToChain = response.syncedToChain
        self.blockHeight = response.blockHeight
        self.network = response.chains[0].network
        if (self.startingSyncTimestamp === null) {
          self.startingSyncTimestamp = response.bestHeaderTimestamp || 0
        }
        if (!response.syncedToChain) {
          //     self._notification.display({
          //       msg: `Syncing to chain (block: ${response.blockHeight})`,
          //       wait: true,
          //     });
          console.tron.log(`Syncing to chain (block: ${response.blockHeight})`)
          self.percentSynced = calcPercentSynced(response)
        } else {
          // this._store.settings.restoring = false;
          // this._notification.display({
          //   type: 'success',
          //   msg: 'Syncing complete',
          // });
          console.tron.log('Syncing complete')
        }
        return response.syncedToChain
      } catch (err) {
        console.tron.error('Getting node info failed', err)
      }
    })

    // this get triggered after the wallet is being unlocked
    const walletGotOpened = flow(function * () {
      getInfo()
      newAddress()
      update_transactions()
      update_balance()
    })

    const unlockWallet = flow(function * () {
      // TODO: auth with biometrics/passcode
      const wallet_password = yield new KeychainAction().getItem('password')

      try {
        yield getEnv(self).lnd.grpc.sendUnlockerCommand('UnlockWallet', {
          walletPassword: Buffer.from(wallet_password, 'hex'),
        })

        yield walletGotOpened()
      } catch (err) {
        console.tron.error(err)
      }
    })

    const newAddress = flow(function * () {
      const { address } = yield getEnv(self).lnd.grpc.sendCommand('NewAddress', { type: 0 })
      self.onChainAddress = address
      console.tron.log(address)
    })

    const addInvoice = flow(function * () {
      const response = yield getEnv(self).lnd.grpc.sendCommand('addInvoice', {
        value: 10000,
        memo: "this is a memo",
        expiry: 172800, // 48 hours
        private: true,
      })

      const invoice = response.paymentRequest
      console.tron.log('invoice: ', invoice),
      self.pendingInvoice = invoice
    })

    const update_transactions = flow(function * () {
      try {
        const { transactions } = yield getEnv(self).lnd.grpc.sendCommand('getTransactions')
        console.tron.log('raw tx: ', transactions)

        const txs = transactions.map(transaction => ({
          id: transaction.txHash,
          type: 'bitcoin',
          amount: transaction.amount,
          fee: transaction.totalFees,
          confirmations: transaction.numConfirmations,
          status: transaction.numConfirmations < 3 ? 'unconfirmed' : 'confirmed',
          date: parseDate(transaction.timeStamp),
          moneyIn: transaction.amount > 0, // FIXME verify is this works like this for lnd
        }))
        console.tron.log('tx: ', txs)

        self.transactions = txs.map(tx => ({
          name: tx.moneyIn ? "Received" : "Sent",
          icon: tx.moneyIn ? "ios-download" : "ios-exit",
          amount: tx.amount,
          date: tx.date,

          //   tx.moneyIn ?
          //   tx.addr = tx.inputs[0].prev_out.addr : // show input (the other address) if money comes in
          //   tx.addr = tx.out[0].addr
          //   tx.addr_fmt = `${tx.addr.slice(0, 11)}...${tx.addr.slice(-10)}`
          //   tx.addr = tx.addr_fmt // TODO FIXME better naming

          // FIXME: this is tx hash, use address instead
          addr: `${tx.id.slice(0, 11)}...${tx.id.slice(-10)}`,
        }))
      } catch (err) {
        console.tron.error('Listing transactions failed', err)
      }
    })

    const update_balance = flow(function * () {
      try {
        const r = yield getEnv(self).lnd.grpc.sendCommand('WalletBalance')
        self.confirmedBalance = r.confirmedBalance
        self.unconfirmedBalance = r.unconfirmedBalance
      } catch (err) {
        console.tron.error('Getting wallet balance failed', err)
      }
    })

    const update_invoices = flow(function * (invoice_updated = undefined) {
      console.tron.log("update_invoices")

      try {
        const { invoices } = yield getEnv(self).lnd.grpc.sendCommand('listInvoices')
        self.invoices = invoices.map(invoice => ({
          id: toHex(invoice.rHash),
          type: 'lightning',
          amount: invoice.value,
          status: invoice.settled ? 'complete' : 'in-progress',
          date: parseDate(invoice.creationDate),
          memo: invoice.memo,
        }))
      } catch (err) {
        console.tron.error('Listing invoices failed')
        console.tron.error(err)
      }

      if (invoice_updated === undefined) return
      if (!invoice_updated.settled) return
      // const { computedTransactions, unitLabel } = this._store
      // let inv = computedTransactions.find(tx => tx.id === toHex(invoice_updated.rHash))
      // this._notification.display({
      //   type: 'success',
      //   msg: `Invoice success: received ${inv.amountLabel} ${unitLabel || ''}`,
      //   handler: () => this.select({ item: inv }),
      //   handlerLbl: 'View details',
      // })
    })

    const send_transaction = flow(function * (addr, amount) {
      return yield getEnv(self).lnd.grpc.sendCommand('sendCoins', { addr, amount })
    })

    // doesn't update the store, should this be here?
    const pay_invoice = flow(function * (payreq) {
      const PAYMENT_TIMEOUT = 10000

      let failed = false
      const timeout = setTimeout(() => {
        failed = true
        // TODO: do something to show payment failed
      }, PAYMENT_TIMEOUT)

      try {
        const stream = getEnv(self).lnd.grpc.sendStreamCommand('sendPayment')

        yield new Promise((resolve, reject) => {
          stream.on('data', data => {
            if (data.paymentError) {
              reject(new Error(`Lightning payment error: ${data.paymentError}`))
            } else {
              resolve()
            }
          })
          stream.on('error', reject)
          stream.write(JSON.stringify({ paymentRequest: payreq }), 'utf8')
        })

        if (failed) return
      } catch (err) {
        if (failed) return

        // this._nav.goPayLightningConfirm();
        // this._notification.display({ msg: 'Lightning payment failed!', err });
      } finally {
        clearTimeout(timeout)
      }
    })

    const list_payments = flow(function * () {
      try {
        const { payments } = yield getEnv(self).lnd.grpc.sendCommand('listPayments')

        console.tron.log(payments)

        self.payments = payments.map(payment => ({
          id: payment.paymentHash,
          type: 'lightning',
          amount: -1 * payment.value,
          fee: payment.fee,
          status: 'complete',
          date: parseDate(payment.creationDate),
          preimage: payment.paymentPreimage,
          paymentRequest: payment.paymentRequest,
        }))
      } catch (err) {
        console.tron.error('Listing payments failed', err)
      }
    })

    return {
      initState,
      genSeed,
      initWallet,
      unlockWallet,
      sendPubKey,
      listPeers,
      getInfo,
      addInvoice,
      connectGaloyPeer,
      openChannel,
      walletGotOpened,
      newAddress,
      update_transactions,
      update_balance,
      update_invoices,
      pay_invoice,
      list_payments,
      send_transaction,
    }
  })
  .views(self => ({
    get currency() {
      return CurrencyType.BTC
    }
  }))

export const AccountModel = types.union(FiatAccountModel, LndModel)

export const RatesModel = types
  .model("Rates", {
    USD: 1, // TODO is there a way to have enum as parameter?
    BTC: 0.0001, // Satoshi to USD default value
  })
  .actions(self => {
    const update = flow(function * () {
      try {
        const doc = yield firestore().doc('global/price').get()
        self.BTC = doc.data().BTC
      } catch (err) {
        console.tron.error('error getting BTC price from firestore', err)
      }
    })
    return { update }
  })

export const DataStoreModel = types
  .model("DataStore", {
    auth: types.optional(AuthModel, {}),
    fiat: types.optional(FiatAccountModel, {}),
    rates: types.optional(RatesModel, {}),
    exchange: types.optional(ExchangeModel, {}),
    lnd: types.optional(LndModel, {}), // TODO should it be optional?
  })
  .actions(self => {
    const update_transactions = flow(function * () {
      // TODO parrallel call?
      self.fiat.update_transactions()
      self.lnd.update_transactions()
      self.lnd.update_balance()
    })

    const update_balance = flow(function * () {
      // TODO parrallel call?
      self.rates.update()
      self.fiat.update_balance()
      self.lnd.update_balance()
    })

    return { update_transactions, update_balance }
  })
  .views(self => ({
    get total_usd_balance() { // in USD
      return self.fiat.balance + self.lnd.balance * self.rates[self.lnd.currency]
    },

    get usd_balances() { // return an Object mapping account to USD balance
      const balances = {} // TODO refactor? AccountType.Bitcoin can't be used as key in constructor?
      balances[AccountType.Bitcoin] = self.lnd.balance * self.rates[self.lnd.currency]
      balances[AccountType.Checking] = self.fiat.balance
      return balances
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
