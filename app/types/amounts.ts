import { WalletCurrency } from "@app/graphql/generated"

export const DisplayCurrency = "DisplayCurrency" as const
export type DisplayCurrency = typeof DisplayCurrency

export type DisplayAmount = MoneyAmount<DisplayCurrency>
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

export type WalletAmount<T extends WalletCurrency> = MoneyAmount<T>

export type UsdMoneyAmount = WalletAmount<typeof WalletCurrency.Usd>
export type BtcMoneyAmount = WalletAmount<typeof WalletCurrency.Btc>
