import { Instance } from "mobx-state-tree"
import { FaucetResultModelBase } from "./FaucetResultModel.base"

/* The TypeScript type of an instance of FaucetResultModel */
export interface FaucetResultModelType extends Instance<typeof FaucetResultModel.Type> {}

/* A graphql query fragment builders for FaucetResultModel */
export { selectFromFaucetResult, faucetResultModelPrimitives, FaucetResultModelSelector } from "./FaucetResultModel.base"

/**
 * FaucetResultModel
 */
export const FaucetResultModel = FaucetResultModelBase
  .actions(self => ({
    // This is an auto-generated example action.
    log() {
      console.log(JSON.stringify(self))
    }
  }))
