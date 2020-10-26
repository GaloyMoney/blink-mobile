import { Instance } from "mobx-state-tree"
import { CoordinateModelBase } from "./CoordinateModel.base"

/* The TypeScript type of an instance of CoordinateModel */
export interface CoordinateModelType extends Instance<typeof CoordinateModel.Type> {}

/* A graphql query fragment builders for CoordinateModel */
export { selectFromCoordinate, coordinateModelPrimitives, CoordinateModelSelector } from "./CoordinateModel.base"

/**
 * CoordinateModel
 */
export const CoordinateModel = CoordinateModelBase
  .actions(self => ({
    // This is an auto-generated example action.
    log() {
      console.log(JSON.stringify(self))
    }
  }))
