/* This is a mst-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */

import { types } from "mobx-state-tree"
import { QueryBuilder } from "mst-gql"
import { ModelBase } from "./ModelBase"
import { RootStoreType } from "./index"


/**
 * OnchainTransactionBase
 * auto generated base class for the model OnchainTransactionModel.
 */
export const OnchainTransactionModelBase = ModelBase
  .named('OnchainTransaction')
  .props({
    __typename: types.optional(types.literal("OnchainTransaction"), "OnchainTransaction"),
    tx: types.union(types.undefined, types.null, types.string),
  })
  .views(self => ({
    get store() {
      return self.__getStore<RootStoreType>()
    }
  }))

export class OnchainTransactionModelSelector extends QueryBuilder {
  get tx() { return this.__attr(`tx`) }
}
export function selectFromOnchainTransaction() {
  return new OnchainTransactionModelSelector()
}

export const onchainTransactionModelPrimitives = selectFromOnchainTransaction().tx
