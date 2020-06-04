import { Instance } from "mobx-state-tree"
import { EarnModelBase } from "./EarnModel.base"

/* The TypeScript type of an instance of EarnModel */
export interface EarnModelType extends Instance<typeof EarnModel.Type> {}

/* A graphql query fragment builders for EarnModel */
export { selectFromEarn, earnModelPrimitives, EarnModelSelector } from "./EarnModel.base"

/**
 * EarnModel
 */
export const EarnModel = EarnModelBase
  .actions(self => ({
    // This is an auto-generated example action.
    log() {
      console.log(JSON.stringify(self))
    }
  }))
