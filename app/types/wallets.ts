import { WalletCurrency } from "@app/graphql/generated"

export type WalletDescriptor<T extends WalletCurrency> = {
  id: string
  currency: T
}

export type UsdWalletDescriptor = WalletDescriptor<"USD">
export type BtcWalletDescriptor = WalletDescriptor<"BTC">
