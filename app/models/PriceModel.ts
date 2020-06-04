import { Instance } from "mobx-state-tree"
import { PriceModelBase } from "./PriceModel.base"

/* The TypeScript type of an instance of PriceModel */
export interface PriceModelType extends Instance<typeof PriceModel.Type> {}

/* A graphql query fragment builders for PriceModel */
export { selectFromPrice, priceModelPrimitives, PriceModelSelector } from "./PriceModel.base"

/**
 * PriceModel
 */
export const PriceModel = PriceModelBase
  .actions(self => ({
    // This is an auto-generated example action.
    log() {
      console.log(JSON.stringify(self))
    }
  }))
