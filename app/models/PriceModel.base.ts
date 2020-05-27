/* This is a mst-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */

import { types } from "mobx-state-tree"
import { QueryBuilder } from "mst-gql"
import { ModelBase } from "./ModelBase"
import { RootStoreType } from "./index"


/**
 * PriceBase
 * auto generated base class for the model PriceModel.
 */
export const PriceModelBase = ModelBase
  .named('Price')
  .props({
    __typename: types.optional(types.literal("Price"), "Price"),
    id: types.identifier,
    o: types.union(types.undefined, types.null, types.number),
  })
  .views(self => ({
    get store() {
      return self.__getStore<RootStoreType>()
    }
  }))

export class PriceModelSelector extends QueryBuilder {
  get id() { return this.__attr(`id`) }
  get o() { return this.__attr(`o`) }
}
export function selectFromPrice() {
  return new PriceModelSelector()
}

export const priceModelPrimitives = selectFromPrice().o
