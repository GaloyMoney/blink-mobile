/* This is a mst-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */

import { types } from "mobx-state-tree"
import { QueryBuilder } from "mst-gql"
import { ModelBase } from "./ModelBase"
import { CoordinateModel, CoordinateModelType } from "./CoordinateModel"
import { CoordinateModelSelector } from "./CoordinateModel.base"
import { RootStoreType } from "./index"


/**
 * MarkerBase
 * auto generated base class for the model MarkerModel.
 */
export const MarkerModelBase = ModelBase
  .named('Marker')
  .props({
    __typename: types.optional(types.literal("Marker"), "Marker"),
    id: types.identifier,
    title: types.union(types.undefined, types.null, types.string),
    coordinate: types.union(types.undefined, types.null, types.late((): any => CoordinateModel)),
  })
  .views(self => ({
    get store() {
      return self.__getStore<RootStoreType>()
    }
  }))

export class MarkerModelSelector extends QueryBuilder {
  get id() { return this.__attr(`id`) }
  get title() { return this.__attr(`title`) }
  coordinate(builder?: string | CoordinateModelSelector | ((selector: CoordinateModelSelector) => CoordinateModelSelector)) { return this.__child(`coordinate`, CoordinateModelSelector, builder) }
}
export function selectFromMarker() {
  return new MarkerModelSelector()
}

export const markerModelPrimitives = selectFromMarker().title
