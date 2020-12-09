/* This is a mst-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */

import { types } from "mobx-state-tree"
import { MSTGQLRef, QueryBuilder, withTypedRefs } from "mst-gql"
import { ModelBase } from "./ModelBase"
import { UserModel, UserModelType } from "./UserModel"
import { UserModelSelector } from "./UserModel.base"
import { RootStoreType } from "./index"


/* The TypeScript type that explicits the refs to other models in order to prevent a circular refs issue */
type Refs = {
  setLevel: UserModelType;
}

/**
 * UpdateUserBase
 * auto generated base class for the model UpdateUserModel.
 */
export const UpdateUserModelBase = withTypedRefs<Refs>()(ModelBase
  .named('UpdateUser')
  .props({
    __typename: types.optional(types.literal("UpdateUser"), "UpdateUser"),
    setLanguage: types.union(types.undefined, types.null, types.boolean),
    setLevel: types.union(types.undefined, types.null, MSTGQLRef(types.late((): any => UserModel))),
    setUsername: types.union(types.undefined, types.null, types.boolean),
  })
  .views(self => ({
    get store() {
      return self.__getStore<RootStoreType>()
    }
  })))

export class UpdateUserModelSelector extends QueryBuilder {
  get setLanguage() { return this.__attr(`setLanguage`) }
  get setUsername() { return this.__attr(`setUsername`) }
  setLevel(builder?: string | UserModelSelector | ((selector: UserModelSelector) => UserModelSelector)) { return this.__child(`setLevel`, UserModelSelector, builder) }
}
export function selectFromUpdateUser() {
  return new UpdateUserModelSelector()
}

export const updateUserModelPrimitives = selectFromUpdateUser().setLanguage.setUsername
