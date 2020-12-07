/* This is a mst-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */

import { types } from "mobx-state-tree"
import { QueryBuilder } from "mst-gql"
import { ModelBase } from "./ModelBase"
import { RootStoreType } from "./index"


/**
 * UserBase
 * auto generated base class for the model UserModel.
 */
export const UserModelBase = ModelBase
  .named('User')
  .props({
    __typename: types.optional(types.literal("User"), "User"),
    id: types.identifier,
    username: types.union(types.undefined, types.null, types.string),
    level: types.union(types.undefined, types.integer),
    phone: types.union(types.undefined, types.null, types.string),
    contacts: types.union(types.undefined, types.null, types.array(types.union(types.null, types.string))),
    language: types.union(types.undefined, types.null, types.string),
  })
  .views(self => ({
    get store() {
      return self.__getStore<RootStoreType>()
    }
  }))

export class UserModelSelector extends QueryBuilder {
  get id() { return this.__attr(`id`) }
  get username() { return this.__attr(`username`) }
  get level() { return this.__attr(`level`) }
  get phone() { return this.__attr(`phone`) }
  get contacts() { return this.__attr(`contacts`) }
  get language() { return this.__attr(`language`) }
}
export function selectFromUser() {
  return new UserModelSelector()
}

export const userModelPrimitives = selectFromUser().username.level.phone.contacts.language
