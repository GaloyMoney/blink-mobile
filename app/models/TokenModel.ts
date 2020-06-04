import { Instance } from "mobx-state-tree"
import { TokenModelBase } from "./TokenModel.base"

/* The TypeScript type of an instance of TokenModel */
export interface TokenModelType extends Instance<typeof TokenModel.Type> {}

/* A graphql query fragment builders for TokenModel */
export { selectFromToken, tokenModelPrimitives, TokenModelSelector } from "./TokenModel.base"

/**
 * TokenModel
 */
export const TokenModel = TokenModelBase
  .actions(self => ({
    // This is an auto-generated example action.
    log() {
      console.log(JSON.stringify(self))
    }
  }))
