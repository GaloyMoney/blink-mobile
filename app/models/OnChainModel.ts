import { Instance } from "mobx-state-tree"
import { OnChainModelBase } from "./OnChainModel.base"

/* The TypeScript type of an instance of OnChainModel */
export interface OnChainModelType extends Instance<typeof OnChainModel.Type> {}

/* A graphql query fragment builders for OnChainModel */
export { selectFromOnChain, onChainModelPrimitives, OnChainModelSelector } from "./OnChainModel.base"

/**
 * OnChainModel
 */
export const OnChainModel = OnChainModelBase
  .actions(self => ({
    // This is an auto-generated example action.
    log() {
      console.log(JSON.stringify(self))
    }
  }))
