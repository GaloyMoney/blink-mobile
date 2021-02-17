/* This is a mst-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */

import { IObservableArray } from "mobx"
import { types } from "mobx-state-tree"
import { MSTGQLRef, QueryBuilder, withTypedRefs } from "mst-gql"
import { ModelBase } from "./ModelBase"
import { BalanceModel, BalanceModelType } from "./BalanceModel"
import { BalanceModelSelector } from "./BalanceModel.base"
import { TransactionModel, TransactionModelType } from "./TransactionModel"
import { TransactionModelSelector } from "./TransactionModel.base"
import { RootStoreType } from "./index"


/* The TypeScript type that explicits the refs to other models in order to prevent a circular refs issue */
type Refs = {
  balances: IObservableArray<BalanceModelType>;
  transactions: IObservableArray<TransactionModelType>;
}

/**
 * Wallet2Base
 * auto generated base class for the model Wallet2Model.
 */
export const Wallet2ModelBase = withTypedRefs<Refs>()(ModelBase
  .named('Wallet2')
  .props({
    __typename: types.optional(types.literal("Wallet2"), "Wallet2"),
    balances: types.union(types.undefined, types.null, types.array(types.union(types.null, MSTGQLRef(types.late((): any => BalanceModel))))),
    csv: types.union(types.undefined, types.null, types.string),
    transactions: types.union(types.undefined, types.null, types.array(types.union(types.null, MSTGQLRef(types.late((): any => TransactionModel))))),
  })
  .views(self => ({
    get store() {
      return self.__getStore<RootStoreType>()
    }
  })))

export class Wallet2ModelSelector extends QueryBuilder {
  get csv() { return this.__attr(`csv`) }
  balances(builder?: string | BalanceModelSelector | ((selector: BalanceModelSelector) => BalanceModelSelector)) { return this.__child(`balances`, BalanceModelSelector, builder) }
  transactions(builder?: string | TransactionModelSelector | ((selector: TransactionModelSelector) => TransactionModelSelector)) { return this.__child(`transactions`, TransactionModelSelector, builder) }
}
export function selectFromWallet2() {
  return new Wallet2ModelSelector()
}

export const wallet2ModelPrimitives = selectFromWallet2().csv
