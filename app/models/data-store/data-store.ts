import { Instance, SnapshotOut, types, flow } from "mobx-state-tree"
import { Api, GetPriceResult } from "../../services/api"
import { CurrencyType } from "./CurrencyType"
import { AccountType } from "../../screens/accounts-screen/AccountType"

/**
 * Model description here for TypeScript hints.
 */  
export const Transaction = types
    .model ("Transaction", {
        name: types.string,
        icon: types.string,
        amount: types.number,
        date: types.Date,
        cashback: types.maybe(types.number),
        // TODO add status
    })

export const Account = types
    .model ("Account", {
        transactions: types.optional(types.array(Transaction), []),
        balance: 0,
        type: types.enumeration<AccountType>("Account Type", Object.values(AccountType)),
        currency: types.enumeration<CurrencyType>("Currency Type", Object.values(CurrencyType)),
    })
    .actions(self => ({
        add(transaction) {
            self.transactions.push(transaction)
        },

    }))

  
export const Rates = types
    .model("Rates", {
        USD: 1,
        BTC: 0.0001, // Satoshi to USD default value
    })
    .actions(self => {
        const update = flow(function*() {
            const api = new Api()
            api.setup()
            const result: GetPriceResult = yield api.getPrice()
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
        accounts: types.optional(types.array(Account), []),
        rates: types.optional(Rates, {})
    })
    .views(self => ({
        get total_balance() { // in USD
            return self.accounts.reduce((balance, account) => account.balance * self.rates[account.currency] + balance, 0)
        },

        get balances() { // return an Object mapping account to USD balance
            let obj = {}

            self.accounts.forEach((account) => {
                obj[account.type] = account.balance * self.rates[account.currency]
            })
        
            return obj
        }
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


