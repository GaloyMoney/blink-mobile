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

export type UsdPaymentAmount = PaymentAmount<"USD">
export type BtcPaymentAmount = PaymentAmount<"BTC">
