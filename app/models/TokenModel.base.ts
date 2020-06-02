/* This is a mst-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */

import { types } from "mobx-state-tree"
import { QueryBuilder } from "mst-gql"
import { ModelBase } from "./ModelBase"
import { RootStoreType } from "./index"


/**
 * TokenBase
 * auto generated base class for the model TokenModel.
 */
export const TokenModelBase = ModelBase
  .named('Token')
  .props({
    __typename: types.optional(types.literal("Token"), "Token"),
    token: types.union(types.undefined, types.null, types.string),
  })
  .views(self => ({
    get store() {
      return self.__getStore<RootStoreType>()
    }
  }))

export class TokenModelSelector extends QueryBuilder {
  get token() { return this.__attr(`token`) }
}
export function selectFromToken() {
  return new TokenModelSelector()
}

export const tokenModelPrimitives = selectFromToken().token
