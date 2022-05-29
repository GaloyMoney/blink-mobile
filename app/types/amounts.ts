export enum WalletCurrency {
  BTC = "BTC",
  USD = "USD",
}

export enum DisplayCurrency {
  BTC = "BTC",
  USD = "USD",
}

export type PaymentAmount<T extends WalletCurrency> = {
  amount: number
  currency: T
}
export type DisplayAmount<T extends DisplayCurrency> = {
  amount: number
  currency: T
}

export type BtcDisplayAmount = DisplayAmount<DisplayCurrency.BTC>
export type UsdDisplayAmount = DisplayAmount<DisplayCurrency.USD>

export type UsdPaymentAmount = PaymentAmount<WalletCurrency.USD>
export type BtcPaymentAmount = PaymentAmount<WalletCurrency.BTC>
