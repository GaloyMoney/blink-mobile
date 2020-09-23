import * as currency_fmt from "currency.js"
import { Instance } from "mobx-state-tree"
import moment from "moment"
import { TransactionModelBase } from "./TransactionModel.base"

/* The TypeScript type of an instance of TransactionModel */
export interface TransactionModelType extends Instance<typeof TransactionModel.Type> {}

/* A graphql query fragment builders for TransactionModel */
export { selectFromTransaction, transactionModelPrimitives, TransactionModelSelector } from "./TransactionModel.base"

const date_options = {
  weekday: "short",
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
}

/**
 * TransactionModel
 */
export const TransactionModel = TransactionModelBase
.views(self => {
    // FIXME: this doesn't refresh when prefCurrency is updated
    // const {prefCurrency} = getParentOfType(self, RootStore)
    
    const moment_date = moment.unix(self.created_at)

    return ({
      get date() {
        return moment_date
      },
      get date_format() {
        return moment_date.toLocaleString("en-US", date_options)
      }, 
      get isReceive() {
        return self.amount > 0
      },
      text(prefCurrency) {
        const symbol = prefCurrency === "sats" ? '' : "$"
        
        // manage sign for usd. unlike for amount usd is not signed
        const signAmount = (tx) => prefCurrency === "sats" ? tx.amount : tx.amount > 0 ? tx.usd : - tx.usd
        const getPrecision = (tx) => prefCurrency === "sats" ? 0 : tx.usd < 0.01 ? 4 : 2
        return currency_fmt.default(signAmount(self), { separator: ",", symbol, precision: getPrecision(self) }).format()
      },
  })})
  .actions(self => ({
    // This is an auto-generated example action.
    log() {
      console.log(JSON.stringify(self))
    }
  }))
