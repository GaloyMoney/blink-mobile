import { Instance } from "mobx-state-tree"
import { SuccessModelBase } from "./SuccessModel.base"

/* The TypeScript type of an instance of SuccessModel */
export interface SuccessModelType extends Instance<typeof SuccessModel.Type> {}

/* A graphql query fragment builders for SuccessModel */
export { selectFromSuccess, successModelPrimitives, SuccessModelSelector } from "./SuccessModel.base"

/**
 * SuccessModel
 */
export const SuccessModel = SuccessModelBase
  .actions(self => ({
    // This is an auto-generated example action.
    log() {
      console.log(JSON.stringify(self))
    }
  }))
