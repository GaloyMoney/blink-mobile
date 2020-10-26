/* This is a mst-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */

import { types } from "mobx-state-tree"
import { QueryBuilder } from "mst-gql"
import { ModelBase } from "./ModelBase"
import { RootStoreType } from "./index"


/**
 * CoordinateBase
 * auto generated base class for the model CoordinateModel.
 */
export const CoordinateModelBase = ModelBase
  .named('Coordinate')
  .props({
    __typename: types.optional(types.literal("Coordinate"), "Coordinate"),
    latitude: types.union(types.undefined, types.null, types.number),
    longitude: types.union(types.undefined, types.null, types.number),
  })
  .views(self => ({
    get store() {
      return self.__getStore<RootStoreType>()
    }
  }))

export class CoordinateModelSelector extends QueryBuilder {
  get latitude() { return this.__attr(`latitude`) }
  get longitude() { return this.__attr(`longitude`) }
}
export function selectFromCoordinate() {
  return new CoordinateModelSelector()
}

export const coordinateModelPrimitives = selectFromCoordinate().latitude.longitude
