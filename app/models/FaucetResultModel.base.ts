/* This is a mst-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */

import { types } from "mobx-state-tree"
import { QueryBuilder } from "mst-gql"
import { ModelBase } from "./ModelBase"
import { RootStoreType } from "./index"


/**
 * FaucetResultBase
 * auto generated base class for the model FaucetResultModel.
 */
export const FaucetResultModelBase = ModelBase
  .named('FaucetResult')
  .props({
    __typename: types.optional(types.literal("FaucetResult"), "FaucetResult"),
    success: types.union(types.undefined, types.null, types.boolean),
    amount: types.union(types.undefined, types.null, types.integer),
    currency: types.union(types.undefined, types.null, types.string),
    message: types.union(types.undefined, types.null, types.string),
  })
  .views(self => ({
    get store() {
      return self.__getStore<RootStoreType>()
    }
  }))

export class FaucetResultModelSelector extends QueryBuilder {
  get success() { return this.__attr(`success`) }
  get amount() { return this.__attr(`amount`) }
  get currency() { return this.__attr(`currency`) }
  get message() { return this.__attr(`message`) }
}
export function selectFromFaucetResult() {
  return new FaucetResultModelSelector()
}

export const faucetResultModelPrimitives = selectFromFaucetResult().success.amount.currency.message
