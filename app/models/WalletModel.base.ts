/* This is a mst-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */

import { IObservableArray } from "mobx"
import { types } from "mobx-state-tree"
import { MSTGQLRef, QueryBuilder, withTypedRefs } from "mst-gql"
import { ModelBase } from "./ModelBase"
import { TransactionModel, TransactionModelType } from "./TransactionModel"
import { TransactionModelSelector } from "./TransactionModel.base"
import { RootStoreType } from "./index"


/* The TypeScript type that explicits the refs to other models in order to prevent a circular refs issue */
type Refs = {
  transactions: IObservableArray<TransactionModelType>;
}

/**
 * WalletBase
 * auto generated base class for the model WalletModel.
 */
export const WalletModelBase = withTypedRefs<Refs>()(ModelBase
  .named('Wallet')
  .props({
    __typename: types.optional(types.literal("Wallet"), "Wallet"),
    id: types.identifier,
    currency: types.union(types.undefined, types.null, types.string),
    balance: types.union(types.undefined, types.null, types.integer),
    transactions: types.union(types.undefined, types.null, types.array(types.union(types.null, MSTGQLRef(types.late((): any => TransactionModel))))),
    csv: types.union(types.undefined, types.null, types.string),
  })
  .views(self => ({
    get store() {
      return self.__getStore<RootStoreType>()
    }
  })))

export class WalletModelSelector extends QueryBuilder {
  get id() { return this.__attr(`id`) }
  get currency() { return this.__attr(`currency`) }
  get balance() { return this.__attr(`balance`) }
  get csv() { return this.__attr(`csv`) }
  transactions(builder?: string | TransactionModelSelector | ((selector: TransactionModelSelector) => TransactionModelSelector)) { return this.__child(`transactions`, TransactionModelSelector, builder) }
}
export function selectFromWallet() {
  return new WalletModelSelector()
}

export const walletModelPrimitives = selectFromWallet().currency.balance.csv
