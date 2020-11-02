import { Instance } from "mobx-state-tree"
import { MarkerModelBase } from "./MarkerModel.base"

/* The TypeScript type of an instance of MarkerModel */
export interface MarkerModelType extends Instance<typeof MarkerModel.Type> {}

/* A graphql query fragment builders for MarkerModel */
export { selectFromMarker, markerModelPrimitives, MarkerModelSelector } from "./MarkerModel.base"

/**
 * MarkerModel
 */
export const MarkerModel = MarkerModelBase
  .actions(self => ({
    // This is an auto-generated example action.
    log() {
      console.log(JSON.stringify(self))
    }
  }))
