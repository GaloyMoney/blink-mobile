import { Instance } from "mobx-state-tree"
import { BuildParameterModelBase } from "./BuildParameterModel.base"

/* The TypeScript type of an instance of BuildParameterModel */
export interface BuildParameterModelType extends Instance<typeof BuildParameterModel.Type> {}

/* A graphql query fragment builders for BuildParameterModel */
export { selectFromBuildParameter, buildParameterModelPrimitives, BuildParameterModelSelector } from "./BuildParameterModel.base"

/**
 * BuildParameterModel
 */
export const BuildParameterModel = BuildParameterModelBase
  .actions(self => ({
    // This is an auto-generated example action.
    log() {
      console.log(JSON.stringify(self))
    }
  }))
