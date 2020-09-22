/* This is a mst-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */

import { types } from "mobx-state-tree"
import { QueryBuilder } from "mst-gql"
import { ModelBase } from "./ModelBase"
import { SuccessModel, SuccessModelType } from "./SuccessModel"
import { SuccessModelSelector } from "./SuccessModel.base"
import { RootStoreType } from "./index"


/**
 * OnChainBase
 * auto generated base class for the model OnChainModel.
 */
export const OnChainModelBase = ModelBase
  .named('OnChain')
  .props({
    __typename: types.optional(types.literal("OnChain"), "OnChain"),
    getNewAddress: types.union(types.undefined, types.null, types.string),
    pay: types.union(types.undefined, types.null, types.late((): any => SuccessModel)),
    getFees: types.union(types.undefined, types.null, types.integer),
  })
  .views(self => ({
    get store() {
      return self.__getStore<RootStoreType>()
    }
  }))

export class OnChainModelSelector extends QueryBuilder {
  get getNewAddress() { return this.__attr(`getNewAddress`) }
  get getFees() { return this.__attr(`getFees`) }
  pay(builder?: string | SuccessModelSelector | ((selector: SuccessModelSelector) => SuccessModelSelector)) { return this.__child(`pay`, SuccessModelSelector, builder) }
}
export function selectFromOnChain() {
  return new OnChainModelSelector()
}

export const onChainModelPrimitives = selectFromOnChain().getNewAddress.getFees
