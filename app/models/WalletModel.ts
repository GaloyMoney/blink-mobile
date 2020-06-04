import { Instance } from "mobx-state-tree"
import { WalletModelBase } from "./WalletModel.base"

/* The TypeScript type of an instance of WalletModel */
export interface WalletModelType extends Instance<typeof WalletModel.Type> {}

/* A graphql query fragment builders for WalletModel */
export { selectFromWallet, walletModelPrimitives, WalletModelSelector } from "./WalletModel.base"

/**
 * WalletModel
 */
export const WalletModel = WalletModelBase
  .actions(self => ({
    // This is an auto-generated example action.
    log() {
      console.log(JSON.stringify(self))
    }
  }))
