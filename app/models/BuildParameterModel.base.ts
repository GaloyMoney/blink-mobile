/* This is a mst-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */

import { types } from "mobx-state-tree"
import { QueryBuilder } from "mst-gql"
import { ModelBase } from "./ModelBase"
import { RootStoreType } from "./index"


/**
 * BuildParameterBase
 * auto generated base class for the model BuildParameterModel.
 */
export const BuildParameterModelBase = ModelBase
  .named('BuildParameter')
  .props({
    __typename: types.optional(types.literal("BuildParameter"), "BuildParameter"),
    commitHash: types.union(types.undefined, types.null, types.string),
    buildTime: types.union(types.undefined, types.null, types.string),
    helmRevision: types.union(types.undefined, types.null, types.integer),
    minBuildNumberAndroid: types.union(types.undefined, types.null, types.integer),
    minBuildNumberIos: types.union(types.undefined, types.null, types.integer),
  })
  .views(self => ({
    get store() {
      return self.__getStore<RootStoreType>()
    }
  }))

export class BuildParameterModelSelector extends QueryBuilder {
  get commitHash() { return this.__attr(`commitHash`) }
  get buildTime() { return this.__attr(`buildTime`) }
  get helmRevision() { return this.__attr(`helmRevision`) }
  get minBuildNumberAndroid() { return this.__attr(`minBuildNumberAndroid`) }
  get minBuildNumberIos() { return this.__attr(`minBuildNumberIos`) }
}
export function selectFromBuildParameter() {
  return new BuildParameterModelSelector()
}

export const buildParameterModelPrimitives = selectFromBuildParameter().commitHash.buildTime.helmRevision.minBuildNumberAndroid.minBuildNumberIos
