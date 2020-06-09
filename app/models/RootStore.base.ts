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
import { SuccessModel, SuccessModelType } from "./SuccessModel"
import { successModelPrimitives, SuccessModelSelector } from "./SuccessModel.base"
import { TokenModel, TokenModelType } from "./TokenModel"
import { tokenModelPrimitives, TokenModelSelector } from "./TokenModel.base"
import { InvoiceModel, InvoiceModelType } from "./InvoiceModel"
import { invoiceModelPrimitives, InvoiceModelSelector } from "./InvoiceModel.base"

import { Network } from "./NetworkEnum"

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
mutateRequestPhoneCode="mutateRequestPhoneCode",
mutateLogin="mutateLogin",
mutateInvoice="mutateInvoice",
mutateEarnCompleted="mutateEarnCompleted",
mutateUpdateUser="mutateUpdateUser"
}

/**
* Store, managing, among others, all the objects received through graphQL
*/
export const RootStoreBase = withTypedRefs<Refs>()(MSTGQLStore
  .named("RootStore")
  .extend(configureStoreMixin([['Price', () => PriceModel], ['Wallet', () => WalletModel], ['Transaction', () => TransactionModel], ['Earn', () => EarnModel], ['User', () => UserModel], ['Success', () => SuccessModel], ['Token', () => TokenModel], ['Invoice', () => InvoiceModel]], ['Price', 'Wallet', 'Transaction', 'Earn', 'User'], "js"))
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
    queryWallet(variables?: {  }, resultSelector: string | ((qb: WalletModelSelector) => WalletModelSelector) = walletModelPrimitives.toString(), options: QueryOptions = {}) {
      return self.query<{ wallet: WalletModelType[]}>(`query wallet { wallet {
        ${typeof resultSelector === "function" ? resultSelector(new WalletModelSelector()).toString() : resultSelector}
      } }`, variables, options)
    },
    queryEarnList(variables?: {  }, resultSelector: string | ((qb: EarnModelSelector) => EarnModelSelector) = earnModelPrimitives.toString(), options: QueryOptions = {}) {
      return self.query<{ earnList: EarnModelType[]}>(`query earnList { earnList {
        ${typeof resultSelector === "function" ? resultSelector(new EarnModelSelector()).toString() : resultSelector}
      } }`, variables, options)
    },
    queryMe(variables?: {  }, resultSelector: string | ((qb: UserModelSelector) => UserModelSelector) = userModelPrimitives.toString(), options: QueryOptions = {}) {
      return self.query<{ me: UserModelType}>(`query me { me {
        ${typeof resultSelector === "function" ? resultSelector(new UserModelSelector()).toString() : resultSelector}
      } }`, variables, options)
    },
    mutateRequestPhoneCode(variables: { phone?: string }, resultSelector: string | ((qb: SuccessModelSelector) => SuccessModelSelector) = successModelPrimitives.toString(), optimisticUpdate?: () => void) {
      return self.mutate<{ requestPhoneCode: SuccessModelType}>(`mutation requestPhoneCode($phone: String) { requestPhoneCode(phone: $phone) {
        ${typeof resultSelector === "function" ? resultSelector(new SuccessModelSelector()).toString() : resultSelector}
      } }`, variables, optimisticUpdate)
    },
    mutateLogin(variables: { phone?: string, code?: number, network?: Network }, resultSelector: string | ((qb: TokenModelSelector) => TokenModelSelector) = tokenModelPrimitives.toString(), optimisticUpdate?: () => void) {
      return self.mutate<{ login: TokenModelType}>(`mutation login($phone: String, $code: Int, $network: Network) { login(phone: $phone, code: $code, network: $network) {
        ${typeof resultSelector === "function" ? resultSelector(new TokenModelSelector()).toString() : resultSelector}
      } }`, variables, optimisticUpdate)
    },
    mutateInvoice(variables?: {  }, resultSelector: string | ((qb: InvoiceModelSelector) => InvoiceModelSelector) = invoiceModelPrimitives.toString(), optimisticUpdate?: () => void) {
      return self.mutate<{ invoice: InvoiceModelType}>(`mutation invoice { invoice {
        ${typeof resultSelector === "function" ? resultSelector(new InvoiceModelSelector()).toString() : resultSelector}
      } }`, variables, optimisticUpdate)
    },
    mutateEarnCompleted(variables: { ids?: string[] }, resultSelector: string | ((qb: EarnModelSelector) => EarnModelSelector) = earnModelPrimitives.toString(), optimisticUpdate?: () => void) {
      return self.mutate<{ earnCompleted: EarnModelType[]}>(`mutation earnCompleted($ids: [ID]) { earnCompleted(ids: $ids) {
        ${typeof resultSelector === "function" ? resultSelector(new EarnModelSelector()).toString() : resultSelector}
      } }`, variables, optimisticUpdate)
    },
    mutateUpdateUser(variables: { user?: InputUser }, resultSelector: string | ((qb: UserModelSelector) => UserModelSelector) = userModelPrimitives.toString(), optimisticUpdate?: () => void) {
      return self.mutate<{ updateUser: UserModelType}>(`mutation updateUser($user: InputUser) { updateUser(user: $user) {
        ${typeof resultSelector === "function" ? resultSelector(new UserModelSelector()).toString() : resultSelector}
      } }`, variables, optimisticUpdate)
    },
  })))
