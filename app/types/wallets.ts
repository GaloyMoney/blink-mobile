import { WalletCurrency } from "./amounts"

export type WalletDescriptor<T extends WalletCurrency> = {
  id: string
  currency: T
}

export type UsdWalletDescriptor = WalletDescriptor<WalletCurrency.USD>
export type BtcWalletDescriptor = WalletDescriptor<WalletCurrency.BTC>
