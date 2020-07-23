import { Instance } from "mobx-state-tree"
import { OnchainTransactionModelBase } from "./OnchainTransactionModel.base"

/* The TypeScript type of an instance of OnchainTransactionModel */
export interface OnchainTransactionModelType extends Instance<typeof OnchainTransactionModel.Type> {}

/* A graphql query fragment builders for OnchainTransactionModel */
export { selectFromOnchainTransaction, onchainTransactionModelPrimitives, OnchainTransactionModelSelector } from "./OnchainTransactionModel.base"

/**
 * OnchainTransactionModel
 */
export const OnchainTransactionModel = OnchainTransactionModelBase
  .actions(self => ({
    // This is an auto-generated example action.
    log() {
      console.log(JSON.stringify(self))
    }
  }))
