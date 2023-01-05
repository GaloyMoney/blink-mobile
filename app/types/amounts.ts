export enum WalletCurrency {
  BTC = "BTC",
  USD = "USD",
}

export type WalletCurrencyType = "BTC" | "USD"

export enum DisplayCurrency {
  BTC = "BTC",
  USD = "USD",
}

export type PaymentAmount = {
  amount: number
  currency: WalletCurrencyType
}
export type DisplayAmount<T extends DisplayCurrency> = {
  amount: number
  currency: T
}

export type BtcDisplayAmount = DisplayAmount<DisplayCurrency.BTC>
export type UsdDisplayAmount = DisplayAmount<DisplayCurrency.USD>
