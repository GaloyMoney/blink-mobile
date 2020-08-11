/* This is a mst-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */

import { types } from "mobx-state-tree"
import { QueryBuilder } from "mst-gql"
import { ModelBase } from "./ModelBase"
import { RootStoreType } from "./index"


/**
 * PendingOnchainPaymentBase
 * auto generated base class for the model PendingOnchainPaymentModel.
 */
export const PendingOnchainPaymentModelBase = ModelBase
  .named('PendingOnchainPayment')
  .props({
    __typename: types.optional(types.literal("PendingOnchainPayment"), "PendingOnchainPayment"),
    txId: types.identifier,
    amount: types.union(types.undefined, types.null, types.integer),
  })
  .views(self => ({
    get store() {
      return self.__getStore<RootStoreType>()
    }
  }))

export class PendingOnchainPaymentModelSelector extends QueryBuilder {
  get txId() { return this.__attr(`txId`) }
  get amount() { return this.__attr(`amount`) }
}
export function selectFromPendingOnchainPayment() {
  return new PendingOnchainPaymentModelSelector()
}

export const pendingOnchainPaymentModelPrimitives = selectFromPendingOnchainPayment().txId.amount
