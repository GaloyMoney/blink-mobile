/* This is a mst-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */

import { types } from "mobx-state-tree"
import { QueryBuilder } from "mst-gql"
import { ModelBase } from "./ModelBase"
import { RootStoreType } from "./index"


/**
 * UpdateContactBase
 * auto generated base class for the model UpdateContactModel.
 */
export const UpdateContactModelBase = ModelBase
  .named('UpdateContact')
  .props({
    __typename: types.optional(types.literal("UpdateContact"), "UpdateContact"),
    setName: types.union(types.undefined, types.null, types.boolean),
  })
  .views(self => ({
    get store() {
      return self.__getStore<RootStoreType>()
    }
  }))

export class UpdateContactModelSelector extends QueryBuilder {
  get setName() { return this.__attr(`setName`) }
}
export function selectFromUpdateContact() {
  return new UpdateContactModelSelector()
}

export const updateContactModelPrimitives = selectFromUpdateContact().setName
