import { Instance } from "mobx-state-tree"
import { LastOnChainAddressModelBase } from "./LastOnChainAddressModel.base"

/* The TypeScript type of an instance of LastOnChainAddressModel */
export interface LastOnChainAddressModelType extends Instance<typeof LastOnChainAddressModel.Type> {}

/* A graphql query fragment builders for LastOnChainAddressModel */
export { selectFromLastOnChainAddress, lastOnChainAddressModelPrimitives, LastOnChainAddressModelSelector } from "./LastOnChainAddressModel.base"

/**
 * LastOnChainAddressModel
 */
export const LastOnChainAddressModel = LastOnChainAddressModelBase
  .actions(self => ({
    // This is an auto-generated example action.
    log() {
      console.log(JSON.stringify(self))
    }
  }))
