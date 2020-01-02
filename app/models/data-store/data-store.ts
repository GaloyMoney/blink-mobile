import { Instance, SnapshotOut, types, flow, getParentOfType, getEnv } from "mobx-state-tree"
import { GetPriceResult } from "../../services/coinbase"
import { CurrencyType } from "./CurrencyType"
import { AccountType } from "../../screens/accounts-screen/AccountType"
import { parseDate } from "../../utils/date"
import KeychainAction from "../../utils/keychain"
import { generateSecureRandom } from 'react-native-securerandom';

import functions from '@react-native-firebase/functions';
import firestore from '@react-native-firebase/firestore';

functions().useFunctionsEmulator('http://localhost:5000') // FIXME where to define this properly?

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

export const TransactionModel = types
    .model ("Transaction", {
        name: types.string,
        icon: types.string,
        amount: types.number,
        date: types.Date,
        cashback: types.maybe(types.number),
        addr: types.maybe(types.string), // TODO derived 2 types of transactions for fiat/crytpo?
        // TODO add status
    })

export const BaseAccountModel = types
    .model ("Account", {
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
    side: "", //enum "buy", "sell"
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

    const quoteBTC = flow(function*(side: "buy" | "sell") { 
        try {

            const req = {
                satAmount: 1000,
                side: side,
            }

            var result = yield functions().httpsCallable('quoteBTC')(req)
            console.tron.log('result quoteBTC', result)
            self.quote = result.data

        } catch(err) {
            console.tron.error('quoteBTC: ', err);
            throw err;
        }
    })

    const commonBuySell = (side: string) : boolean /* success */ => {
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

            if (!commonBuySell('buy')) { return }
            
            var result = yield functions().httpsCallable('buyBTC')({
                quote: { ... self.quote },
                
                // TODO: wallet should be opened
                btcAddress: getParentOfType(self, DataStoreModel).lnd.onChainAddress,
            })
            console.tron.log('result BuyBTC', result)
        } catch(err) {
            console.tron.error(err);
            throw err
        }

        self.quote.reset()
    })
    
    const sellBTC = flow(function*() { 
        try {

            if (!commonBuySell('sell')) { return }

            // TODO: may be relevant to check signature 
            // to make sure address is from Galoy?

            const { txid } = yield getParentOfType(self, DataStoreModel).
                lnd.send_transaction(self.quote.address, self.quote.satAmount)

            console.tron.log(txid)

            // TODO : make sure to manage error here, 
            // eg: if the the on chain transaction is send by sellBTC
            // is never called. 
            // this could be done in the backend

            const result = yield functions().httpsCallable('sellBTC')({
                quote: { ... self.quote },
                onchain_tx: txid,
            })
            console.tron.log('result SellBTC', result)
        } catch(err) {
            console.tron.error(err);
            throw err
        }

        self.quote.reset()
    })

    return { quoteBTC, buyBTC, sellBTC }
})

export const FiatAccountModel = BaseAccountModel
    .props ({
        type: AccountType.Checking,
    })
    .actions(self => {
        const update_transactions = flow(function*() {
            const uid = getParentOfType(self, DataStoreModel).auth.uid
            try {
                const doc = yield firestore().collection('users').doc(uid).get()
                self.transactions = doc.data().transactions // TODO better error management
            } catch(err) {
                console.tron.warn(err)
            }
        })

        const update_balance = flow(function*() { 
            try {
                var result = yield functions().httpsCallable('getFiatBalances')({})
                console.tron.log('balance', result)
                if ("data" in result) {
                    self.confirmedBalance = result.data
                    // TODO: add unconfirmed balance
                }
            } catch(err) {
                console.tron.log(err);
            }
        })

        const reset = () => { // TODO test
            self.transactions.length = 0,
            self.confirmedBalance = 0
        }

        return  { update_balance, reset, update_transactions }
    })
    .views(self => ({
        get currency() {
            return CurrencyType.USD
        },
    }))


export const LndModel = BaseAccountModel
    .named("Lnd")
    .props ({
        walletExist: false,
        walletUnlocked: false,
        onChainAddress: "",
        type: AccountType.Bitcoin,
        pubkey: "",
        network: "",
        syncedToChain: false,
        blockHeight: 0,
    })
    .actions(self => {

        // stateless, but must be an action instead of a view because of the async call
        const initState = flow(function*() {
            const WALLET_EXIST = "rpc error: code = Unknown desc = wallet already exists"
            const CLOSED = "Closed"
            let walletExist = false
            try {
                yield getEnv(self).lnd.grpc.sendUnlockerCommand('GenSeed');
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

        const genSeed = flow(function*() {
            try {
                const seed = yield getEnv(self).lnd.grpc.sendUnlockerCommand('GenSeed');
                console.tron.log("seed", seed.cipherSeedMnemonic)
                yield new KeychainAction().setItem('seed', seed.cipherSeedMnemonic.join(" "))    
            } catch (err) {
                console.tron.error(err)
            }
        })

        const initWallet = flow(function*() {

            function toHexString(byteArray) {
                return Array.from(byteArray, function(byte: any) {
                  return ('0' + (byte & 0xFF).toString(16)).slice(-2);
                }).join('')
              }

            const random_number = yield generateSecureRandom(24)
            const wallet_password = toHexString(random_number)

            try {
                yield getEnv(self).lnd.grpc.sendUnlockerCommand('InitWallet', {
                    walletPassword: Buffer.from(wallet_password, 'hex'),
                    cipherSeedMnemonic: (yield new KeychainAction().getItem('seed')).split(" "),
                })
                
                yield new KeychainAction().setItem('password', wallet_password)

                self.walletUnlocked = true;
                self.walletExist = true;
            } catch (err) {
                console.tron.error(err)
            }
        })
        
        // TODO: triggered this automatically after the wallet is being unlocked
        const sendPubKey = flow(function*() {
            // TODO error management
            const result = yield functions().httpsCallable('onUserWalletCreation')({pubkey: self.pubkey, network: self.network})
            console.log(result)
        })

        const connectGaloyPeer = flow(function*() {
            let uri
            
            try {
                const doc = yield firestore().doc(`global/info`).get()
                uri = doc.data().lightning.uris[0]
            } catch(err) {
                console.tron.warn(err)
            }

            const [ pubkey, host ] = uri.split("@")
            console.tron.log(`connecting to:`, { uri, pubkey, host })
            
            // TODO: automatically update: syncedToChain: false

            let connection = yield getEnv(self).lnd.grpc.sendCommand('connectPeer', {
                addr: { pubkey, host: "127.0.0.1" }, //FIXME
            })

            console.log(connection)
        })

        const listPeers = flow(function*() {
            try {
                const result = yield getEnv(self).lnd.grpc.sendCommand('listPeers')
                console.tron.log(result)
            } catch (err) {
                console.tron.error(err)
            }
        })

        const openChannel = flow(function*() {
            // TODO error management
            const result = yield functions().httpsCallable('openChannel')({})
            console.log(result)
        })

        // this get triggered after the wallet is being unlocked
        const walletGotOpened = flow(function*() {
            self.walletUnlocked = true
            const nodeinfo = yield updateBlockchainStatus()
            self.pubkey = nodeinfo.identityPubkey
            self.network = nodeinfo.chains[0].network
            newAddress()
            update_transactions()
            update_balance()
        })

        const updateBlockchainStatus = flow(function*() {
            const nodeinfo = yield getEnv(self).lnd.grpc.sendCommand('GetInfo')
            self.blockHeight = nodeinfo.blockHeight
            self.syncedToChain = nodeinfo.syncedToChain

            return nodeinfo
        })

        const unlockWallet = flow(function*() {
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
         
        const newAddress = flow(function*() {
            const { address } = yield getEnv(self).lnd.grpc.sendCommand('NewAddress', {type: 0})
            self.onChainAddress = address
            console.tron.log(address)
        })

        const update_transactions = flow(function*() {
            try {
              const { transactions } = yield getEnv(self).lnd.grpc.sendCommand('getTransactions');
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
              }));
              console.tron.log('tx: ', txs)

              self.transactions = txs.map(tx => ({
                    name: tx.moneyIn? "Received" : "Sent",
                    icon: tx.moneyIn? "ios-download" : "ios-exit",
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
              console.tron.error('Listing transactions failed', err);
            }
          })

          const update_balance = flow(function*() {
            try {
                const r = yield getEnv(self).lnd.grpc.sendCommand('WalletBalance');
                self.confirmedBalance = r.confirmedBalance;
                self.unconfirmedBalance = r.unconfirmedBalance;
              } catch (err) {
                console.tron.error('Getting wallet balance failed', err);
              }
          })

          const send_transaction = flow(function*(addr, amount) {
            return yield getEnv(self).lnd.grpc.sendCommand('sendCoins', {addr, amount});
          })

        return  { 
            initState,
            genSeed,
            initWallet, 
            unlockWallet, 
            sendPubKey,
            listPeers,
            updateBlockchainStatus,
            connectGaloyPeer,
            openChannel,
            walletGotOpened,
            newAddress, 
            update_transactions,
            update_balance,
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
        USD: 1,  // TODO is there a way to have enum as parameter?
        BTC: 0.0001, // Satoshi to USD default value
    })
    .actions(self => {
        const update = flow(function*() {
            try {
                const doc = yield firestore().doc('global/price').get()
                self.BTC = doc.data().BTC
            } catch (err) {
                console.tron.error('error getting BTC price from firestore', err)
            }
        })
        return  { update }
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
        const update_transactions = flow(function*() {
            // TODO parrallel call?
            self.fiat.update_transactions()
            self.lnd.update_transactions()
            self.lnd.update_balance()
        })

        const update_balance = flow(function*() {
            // TODO parrallel call?
            self.rates.update()
            self.fiat.update_balance()
            self.lnd.update_balance()
        })

        return  { update_transactions, update_balance }
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