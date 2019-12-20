import { Instance, SnapshotOut, types, flow, getParentOfType, getEnv } from "mobx-state-tree"
import { Coinbase, GetPriceResult } from "../../services/coinbase"
import { CurrencyType } from "./CurrencyType"
import { AccountType } from "../../screens/accounts-screen/AccountType"
import firebase from "react-native-firebase"
import { parseDate } from "../../utils/date"

const getFiatBalance = firebase.functions().httpsCallable('getFiatBalances');
const db = firebase.firestore()                


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
        transactions: types.optional(types.array(TransactionModel), []),
        confirmedBalance: 0,
        unconfirmedBalance: 0,
        type: types.enumeration<AccountType>("Account Type", Object.values(AccountType))
    })
    .views(self => ({
        get balance() {
            return self.confirmedBalance + self.unconfirmedBalance
        },
    }))

export const FiatAccountModel = BaseAccountModel
    .props ({
        type: AccountType.Checking
    })
    .actions(self => {
        const update_transactions = flow(function*() {
            const uid = getParentOfType(self, DataStoreModel).auth.uid
            try {
                const doc = yield db.collection('users').doc(uid).get()
                self.transactions = doc.data().transactions // TODO better error management
            } catch(err) {
                console.tron.warn(err)
            }
        })

        const update_balance = flow(function*() { 
            try {
                var result = yield getFiatBalance({})
                if ("data" in result) {
                    let { data } = result
                    self.confirmedBalance = data.Checking
                    // TODO: add unconfirmed balance
                }
            } catch(err) {
                console.tron.log(err);
            }
        })

        const reset = () => { // TODO test
            self.transactions = [],
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
        walletUnlocked: false,
        onChainAddress: "",
        type: AccountType.Bitcoin,
    })
    .actions(self => {
        
        const password = 'abcdef12345678' // FIXME

        const genSeed = flow(function*() {
            const seed = yield getEnv(self).lnd.grpc.sendUnlockerCommand('GenSeed');
            console.tron.log("seed", seed.cipherSeedMnemonic)
        })

        const unlockWallet = flow(function*() {
            const nodeinfo = yield getEnv(self).lnd.grpc.sendUnlockerCommand('UnlockWallet', {
                walletPassword: Buffer.from(password, 'utf8'),
            })
            self.walletUnlocked = true
        })
        
        const nodeInfo = flow(function*() {
            const nodeinfo = yield getEnv(self).lnd.grpc.sendCommand('GetInfo')
            console.tron.log("node info", nodeinfo)
        })
 
        const initWallet = flow(function*() {
            const seed = yield getEnv(self).lnd.grpc.sendUnlockerCommand('GenSeed');
            const initWallet = getEnv(self).lnd.grpc.sendUnlockerCommand('InitWallet', {
                walletPassword: Buffer.from(password, 'utf8'),
                cipherSeedMnemonic: seed.cipherSeedMnemonic,
            })
            self.walletUnlocked = true;
        })
 
        const newAddress = flow(function*() {
            const { address } = yield getEnv(self).lnd.grpc.sendCommand('NewAddress', {type: 0})
            self.onChainAddress = address
            console.tron.log(address)
        })

        const update_transactions = flow(function*() {
            console.tron.log('updating balance')

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

                console.tron.log('lnd balance: ', r)
              } catch (err) {
                console.tron.error('Getting wallet balance failed', err);
              }
          })

          const send_transaction = flow(function*(addr, amount) {
            yield getEnv(self).lnd.grpc.sendCommand('sendCoins', {addr, amount});
          })

        return  { 
            genSeed, 
            nodeInfo, 
            initWallet, 
            unlockWallet, 
            newAddress, 
            update_transactions,
            update_balance,
            send_transaction,
        }
    
    })
    .views(self => ({
        get currency() {
            return CurrencyType.BTC
        },
    }))


export const AccountModel = types.union(FiatAccountModel, LndModel)


export const RatesModel = types
    .model("Rates", {
        USD: 1,  // TODO is there a way to have enum as parameter?
        BTC: 0.0001, // Satoshi to USD default value
    })
    .actions(self => {
        const update = flow(function*() {
            const result: GetPriceResult = yield getEnv(self).api.getPrice()
            if ("price" in result) {
                self.BTC = result.price
            } else {
                console.tron.warn("issue with price API")
                // TODO error management
            }
        })
        return  { update }
    })


export const DataStoreModel = types
    .model("DataStore", {
        auth: types.optional(AuthModel, {}),
        fiat: types.optional(FiatAccountModel, {}),
        rates: types.optional(RatesModel, {}),
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