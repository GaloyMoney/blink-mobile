/* This is a mst-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */

import { types } from "mobx-state-tree"
import { QueryBuilder } from "mst-gql"
import { ModelBase } from "./ModelBase"
import { RootStoreType } from "./index"


/**
 * SuccessBase
 * auto generated base class for the model SuccessModel.
 */
export const SuccessModelBase = ModelBase
  .named('Success')
  .props({
    __typename: types.optional(types.literal("Success"), "Success"),
    success: types.union(types.undefined, types.null, types.boolean),
  })
  .views(self => ({
    get store() {
      return self.__getStore<RootStoreType>()
    }
  }))

export class SuccessModelSelector extends QueryBuilder {
  get success() { return this.__attr(`success`) }
}
export function selectFromSuccess() {
  return new SuccessModelSelector()
}

export const successModelPrimitives = selectFromSuccess().success
