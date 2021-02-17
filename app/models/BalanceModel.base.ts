/* This is a mst-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */

import { types } from "mobx-state-tree"
import { QueryBuilder } from "mst-gql"
import { ModelBase } from "./ModelBase"
import { RootStoreType } from "./index"


/**
 * BalanceBase
 * auto generated base class for the model BalanceModel.
 */
export const BalanceModelBase = ModelBase
  .named('Balance')
  .props({
    __typename: types.optional(types.literal("Balance"), "Balance"),
    id: types.identifier,
    balance: types.union(types.undefined, types.null, types.integer),
  })
  .views(self => ({
    get store() {
      return self.__getStore<RootStoreType>()
    }
  }))

export class BalanceModelSelector extends QueryBuilder {
  get id() { return this.__attr(`id`) }
  get balance() { return this.__attr(`balance`) }
}
export function selectFromBalance() {
  return new BalanceModelSelector()
}

export const balanceModelPrimitives = selectFromBalance().balance
