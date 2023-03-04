import { WalletCurrency } from "@app/graphql/generated"

export type PaymentAmount<T extends WalletCurrency> = {
  amount: number
  currency: T
}

export const DisplayCurrency = "DisplayCurrency" as const
export type DisplayCurrency = typeof DisplayCurrency

export type DisplayAmount = {
  amount: number
  currency: DisplayCurrency
}

export type WalletOrDisplayCurrency = WalletCurrency | DisplayCurrency

export const moneyAmountIsCurrencyType = <T extends WalletOrDisplayCurrency>(
  moneyAmount: MoneyAmount<WalletOrDisplayCurrency>,
  currency: T,
): moneyAmount is MoneyAmount<T> => {
  return moneyAmount.currency === currency
}

export type MoneyAmount<T extends WalletOrDisplayCurrency> = {
  amount: number
  currency: T
}

export type UsdPaymentAmount = PaymentAmount<"USD">
export type BtcPaymentAmount = PaymentAmount<"BTC">
