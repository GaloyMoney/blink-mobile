import { Instance } from "mobx-state-tree"
import { BalanceModelBase } from "./BalanceModel.base"

/* The TypeScript type of an instance of BalanceModel */
export interface BalanceModelType extends Instance<typeof BalanceModel.Type> {}

/* A graphql query fragment builders for BalanceModel */
export { selectFromBalance, balanceModelPrimitives, BalanceModelSelector } from "./BalanceModel.base"

/**
 * BalanceModel
 */
export const BalanceModel = BalanceModelBase
  .actions(self => ({
    // This is an auto-generated example action.
    log() {
      console.log(JSON.stringify(self))
    }
  }))
