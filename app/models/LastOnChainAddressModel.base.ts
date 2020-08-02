/* This is a mst-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */

import { types } from "mobx-state-tree"
import { QueryBuilder } from "mst-gql"
import { ModelBase } from "./ModelBase"
import { RootStoreType } from "./index"


/**
 * LastOnChainAddressBase
 * auto generated base class for the model LastOnChainAddressModel.
 */
export const LastOnChainAddressModelBase = ModelBase
  .named('LastOnChainAddress')
  .props({
    __typename: types.optional(types.literal("LastOnChainAddress"), "LastOnChainAddress"),
    id: types.identifier,
  })
  .views(self => ({
    get store() {
      return self.__getStore<RootStoreType>()
    }
  }))

export class LastOnChainAddressModelSelector extends QueryBuilder {
  get id() { return this.__attr(`id`) }
}
export function selectFromLastOnChainAddress() {
  return new LastOnChainAddressModelSelector()
}

export const lastOnChainAddressModelPrimitives = selectFromLastOnChainAddress()
