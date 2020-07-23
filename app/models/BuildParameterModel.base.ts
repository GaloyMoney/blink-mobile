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
  })
  .views(self => ({
    get store() {
      return self.__getStore<RootStoreType>()
    }
  }))

export class BuildParameterModelSelector extends QueryBuilder {
  get commitHash() { return this.__attr(`commitHash`) }
  get buildTime() { return this.__attr(`buildTime`) }
}
export function selectFromBuildParameter() {
  return new BuildParameterModelSelector()
}

export const buildParameterModelPrimitives = selectFromBuildParameter().commitHash.buildTime
