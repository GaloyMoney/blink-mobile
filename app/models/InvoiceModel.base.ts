/* This is a mst-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */

import { types } from "mobx-state-tree"
import { QueryBuilder } from "mst-gql"
import { ModelBase } from "./ModelBase"
import { RootStoreType } from "./index"


/**
 * InvoiceBase
 * auto generated base class for the model InvoiceModel.
 */
export const InvoiceModelBase = ModelBase
  .named('Invoice')
  .props({
    __typename: types.optional(types.literal("Invoice"), "Invoice"),
    addInvoice: types.union(types.undefined, types.null, types.string),
    updatePendingInvoice: types.union(types.undefined, types.null, types.boolean),
    payInvoice: types.union(types.undefined, types.null, types.string),
    payKeysendUsername: types.union(types.undefined, types.null, types.string),
    getFee: types.union(types.undefined, types.null, types.integer),
  })
  .views(self => ({
    get store() {
      return self.__getStore<RootStoreType>()
    }
  }))

export class InvoiceModelSelector extends QueryBuilder {
  get addInvoice() { return this.__attr(`addInvoice`) }
  get updatePendingInvoice() { return this.__attr(`updatePendingInvoice`) }
  get payInvoice() { return this.__attr(`payInvoice`) }
  get payKeysendUsername() { return this.__attr(`payKeysendUsername`) }
  get getFee() { return this.__attr(`getFee`) }
}
export function selectFromInvoice() {
  return new InvoiceModelSelector()
}

export const invoiceModelPrimitives = selectFromInvoice().addInvoice.updatePendingInvoice.payInvoice.payKeysendUsername.getFee
