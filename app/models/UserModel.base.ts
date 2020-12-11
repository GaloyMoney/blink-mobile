/* This is a mst-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */

import { IObservableArray } from "mobx"
import { types } from "mobx-state-tree"
import { MSTGQLRef, QueryBuilder, withTypedRefs } from "mst-gql"
import { ModelBase } from "./ModelBase"
import { ContactModel, ContactModelType } from "./ContactModel"
import { ContactModelSelector } from "./ContactModel.base"
import { RootStoreType } from "./index"


/* The TypeScript type that explicits the refs to other models in order to prevent a circular refs issue */
type Refs = {
  contacts: IObservableArray<ContactModelType>;
}

/**
 * UserBase
 * auto generated base class for the model UserModel.
 */
export const UserModelBase = withTypedRefs<Refs>()(ModelBase
  .named('User')
  .props({
    __typename: types.optional(types.literal("User"), "User"),
    id: types.identifier,
    username: types.union(types.undefined, types.null, types.string),
    level: types.union(types.undefined, types.integer),
    phone: types.union(types.undefined, types.null, types.string),
    contacts: types.union(types.undefined, types.null, types.array(types.union(types.null, MSTGQLRef(types.late((): any => ContactModel))))),
    language: types.union(types.undefined, types.null, types.string),
  })
  .views(self => ({
    get store() {
      return self.__getStore<RootStoreType>()
    }
  })))

export class UserModelSelector extends QueryBuilder {
  get id() { return this.__attr(`id`) }
  get username() { return this.__attr(`username`) }
  get level() { return this.__attr(`level`) }
  get phone() { return this.__attr(`phone`) }
  get language() { return this.__attr(`language`) }
  contacts(builder?: string | ContactModelSelector | ((selector: ContactModelSelector) => ContactModelSelector)) { return this.__child(`contacts`, ContactModelSelector, builder) }
}
export function selectFromUser() {
  return new UserModelSelector()
}

export const userModelPrimitives = selectFromUser().username.level.phone.language
