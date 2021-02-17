import { Instance } from "mobx-state-tree"
import { Wallet2ModelBase } from "./Wallet2Model.base"

/* The TypeScript type of an instance of Wallet2Model */
export interface Wallet2ModelType extends Instance<typeof Wallet2Model.Type> {}

/* A graphql query fragment builders for Wallet2Model */
export { selectFromWallet2, wallet2ModelPrimitives, Wallet2ModelSelector } from "./Wallet2Model.base"

/**
 * Wallet2Model
 */
export const Wallet2Model = Wallet2ModelBase
  .actions(self => ({
    // This is an auto-generated example action.
    log() {
      console.log(JSON.stringify(self))
    }
  }))
