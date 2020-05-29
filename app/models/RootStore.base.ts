/* This is a mst-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */
import { ObservableMap } from "mobx"
import { types } from "mobx-state-tree"
import { MSTGQLStore, configureStoreMixin, QueryOptions, withTypedRefs } from "mst-gql"

import { PriceModel, PriceModelType } from "./PriceModel"
import { priceModelPrimitives, PriceModelSelector } from "./PriceModel.base"
import { WalletModel, WalletModelType } from "./WalletModel"
import { walletModelPrimitives, WalletModelSelector } from "./WalletModel.base"
import { TransactionModel, TransactionModelType } from "./TransactionModel"
import { transactionModelPrimitives, TransactionModelSelector } from "./TransactionModel.base"
import { EarnModel, EarnModelType } from "./EarnModel"
import { earnModelPrimitives, EarnModelSelector } from "./EarnModel.base"
import { UserModel, UserModelType } from "./UserModel"
import { userModelPrimitives, UserModelSelector } from "./UserModel.base"
import { InvoiceModel, InvoiceModelType } from "./InvoiceModel"
import { invoiceModelPrimitives, InvoiceModelSelector } from "./InvoiceModel.base"


export type InputUser = {
  id?: string
  level?: number
  deviceToken?: string
}
/* The TypeScript type that explicits the refs to other models in order to prevent a circular refs issue */
type Refs = {
  prices: ObservableMap<string, PriceModelType>,
  wallets: ObservableMap<string, WalletModelType>,
  transactions: ObservableMap<string, TransactionModelType>,
  earns: ObservableMap<string, EarnModelType>,
  users: ObservableMap<string, UserModelType>
}


/**
* Enums for the names of base graphql actions
*/
export enum RootStoreBaseQueries {
queryPrices="queryPrices",
queryWallet="queryWallet",
queryEarnList="queryEarnList",
queryMe="queryMe"
}
export enum RootStoreBaseMutations {
mutateInvoice="mutateInvoice",
mutateEarnCompleted="mutateEarnCompleted",
mutateUpdateUser="mutateUpdateUser"
}

/**
* Store, managing, among others, all the objects received through graphQL
*/
export const RootStoreBase = withTypedRefs<Refs>()(MSTGQLStore
  .named("RootStore")
  .extend(configureStoreMixin([['Price', () => PriceModel], ['Wallet', () => WalletModel], ['Transaction', () => TransactionModel], ['Earn', () => EarnModel], ['User', () => UserModel], ['Invoice', () => InvoiceModel]], ['Price', 'Wallet', 'Transaction', 'Earn', 'User'], "js"))
  .props({
    prices: types.optional(types.map(types.late((): any => PriceModel)), {}),
    wallets: types.optional(types.map(types.late((): any => WalletModel)), {}),
    transactions: types.optional(types.map(types.late((): any => TransactionModel)), {}),
    earns: types.optional(types.map(types.late((): any => EarnModel)), {}),
    users: types.optional(types.map(types.late((): any => UserModel)), {})
  })
  .actions(self => ({
    queryPrices(variables?: {  }, resultSelector: string | ((qb: PriceModelSelector) => PriceModelSelector) = priceModelPrimitives.toString(), options: QueryOptions = {}) {
      return self.query<{ prices: PriceModelType[]}>(`query prices { prices {
        ${typeof resultSelector === "function" ? resultSelector(new PriceModelSelector()).toString() : resultSelector}
      } }`, variables, options)
    },
    queryWallet(variables: { uid?: string }, resultSelector: string | ((qb: WalletModelSelector) => WalletModelSelector) = walletModelPrimitives.toString(), options: QueryOptions = {}) {
      return self.query<{ wallet: WalletModelType[]}>(`query wallet($uid: String) { wallet(uid: $uid) {
        ${typeof resultSelector === "function" ? resultSelector(new WalletModelSelector()).toString() : resultSelector}
      } }`, variables, options)
    },
    queryEarnList(variables: { uid?: string }, resultSelector: string | ((qb: EarnModelSelector) => EarnModelSelector) = earnModelPrimitives.toString(), options: QueryOptions = {}) {
      return self.query<{ earnList: EarnModelType[]}>(`query earnList($uid: String) { earnList(uid: $uid) {
        ${typeof resultSelector === "function" ? resultSelector(new EarnModelSelector()).toString() : resultSelector}
      } }`, variables, options)
    },
    queryMe(variables: { uid?: string }, resultSelector: string | ((qb: UserModelSelector) => UserModelSelector) = userModelPrimitives.toString(), options: QueryOptions = {}) {
      return self.query<{ me: UserModelType}>(`query me($uid: String) { me(uid: $uid) {
        ${typeof resultSelector === "function" ? resultSelector(new UserModelSelector()).toString() : resultSelector}
      } }`, variables, options)
    },
    mutateInvoice(variables: { uid?: string }, resultSelector: string | ((qb: InvoiceModelSelector) => InvoiceModelSelector) = invoiceModelPrimitives.toString(), optimisticUpdate?: () => void) {
      return self.mutate<{ invoice: InvoiceModelType}>(`mutation invoice($uid: String) { invoice(uid: $uid) {
        ${typeof resultSelector === "function" ? resultSelector(new InvoiceModelSelector()).toString() : resultSelector}
      } }`, variables, optimisticUpdate)
    },
    mutateEarnCompleted(variables: { id?: string, uid?: string }, resultSelector: string | ((qb: EarnModelSelector) => EarnModelSelector) = earnModelPrimitives.toString(), optimisticUpdate?: () => void) {
      return self.mutate<{ earnCompleted: EarnModelType}>(`mutation earnCompleted($id: ID, $uid: String) { earnCompleted(id: $id, uid: $uid) {
        ${typeof resultSelector === "function" ? resultSelector(new EarnModelSelector()).toString() : resultSelector}
      } }`, variables, optimisticUpdate)
    },
    mutateUpdateUser(variables: { user?: InputUser }, resultSelector: string | ((qb: UserModelSelector) => UserModelSelector) = userModelPrimitives.toString(), optimisticUpdate?: () => void) {
      return self.mutate<{ updateUser: UserModelType}>(`mutation updateUser($user: InputUser) { updateUser(user: $user) {
        ${typeof resultSelector === "function" ? resultSelector(new UserModelSelector()).toString() : resultSelector}
      } }`, variables, optimisticUpdate)
    },
  })))
