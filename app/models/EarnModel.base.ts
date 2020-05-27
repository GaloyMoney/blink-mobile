/* This is a mst-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */

import { types } from "mobx-state-tree"
import { QueryBuilder } from "mst-gql"
import { ModelBase } from "./ModelBase"
import { RootStoreType } from "./index"


/**
 * EarnBase
 * auto generated base class for the model EarnModel.
 */
export const EarnModelBase = ModelBase
  .named('Earn')
  .props({
    __typename: types.optional(types.literal("Earn"), "Earn"),
    /** the earn reward for the app to display their associated amount */
    id: types.identifier,
    value: types.union(types.undefined, types.null, types.integer),
  })
  .views(self => ({
    get store() {
      return self.__getStore<RootStoreType>()
    }
  }))

export class EarnModelSelector extends QueryBuilder {
  get id() { return this.__attr(`id`) }
  get value() { return this.__attr(`value`) }
}
export function selectFromEarn() {
  return new EarnModelSelector()
}

export const earnModelPrimitives = selectFromEarn().value
