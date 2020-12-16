/* This is a mst-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */

import { types } from "mobx-state-tree"
import { QueryBuilder } from "mst-gql"
import { ModelBase } from "./ModelBase"
import { RootStoreType } from "./index"


/**
 * ContactBase
 * auto generated base class for the model ContactModel.
 */
export const ContactModelBase = ModelBase
  .named('Contact')
  .props({
    __typename: types.optional(types.literal("Contact"), "Contact"),
    id: types.identifier,
    name: types.union(types.undefined, types.null, types.string),
    transactionsCount: types.union(types.undefined, types.null, types.integer),
  })
  .views(self => ({
    get store() {
      return self.__getStore<RootStoreType>()
    }
  }))

export class ContactModelSelector extends QueryBuilder {
  get id() { return this.__attr(`id`) }
  get name() { return this.__attr(`name`) }
  get transactionsCount() { return this.__attr(`transactionsCount`) }
}
export function selectFromContact() {
  return new ContactModelSelector()
}

export const contactModelPrimitives = selectFromContact().name.transactionsCount
