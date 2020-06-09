import { Instance } from "mobx-state-tree"
import { TransactionModelBase } from "./TransactionModel.base"

/* The TypeScript type of an instance of TransactionModel */
export interface TransactionModelType extends Instance<typeof TransactionModel.Type> {}

/* A graphql query fragment builders for TransactionModel */
export { selectFromTransaction, transactionModelPrimitives, TransactionModelSelector } from "./TransactionModel.base"

/**
 * TransactionModel
 */
export const TransactionModel = TransactionModelBase
  .actions(self => ({
    // This is an auto-generated example action.
    log() {
      console.log(JSON.stringify(self))
    }
  }))
