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

export const ZeroUsdMoneyAmount: UsdMoneyAmount = {
  amount: 0,
  currency: WalletCurrency.Usd,
}

export const ZeroBtcMoneyAmount: BtcMoneyAmount = {
  amount: 0,
  currency: WalletCurrency.Btc,
}

export const ZeroDisplayAmount: DisplayAmount = {
  amount: 0,
  currency: DisplayCurrency,
}

export const toBtcMoneyAmount = (amount: number | undefined): BtcMoneyAmount => {
  if (amount === undefined) {
    return {
      amount: NaN,
      currency: WalletCurrency.Btc,
    }
  }
  return {
    amount,
    currency: WalletCurrency.Btc,
  }
}

export const toUsdMoneyAmount = (amount: number | undefined): UsdMoneyAmount => {
  if (amount === undefined) {
    return {
      amount: NaN,
      currency: WalletCurrency.Usd,
    }
  }
  return {
    amount,
    currency: WalletCurrency.Usd,
  }
}

export const isNonZeroMoneyAmount = (
  moneyAmount: MoneyAmount<WalletOrDisplayCurrency> | undefined,
): moneyAmount is MoneyAmount<WalletOrDisplayCurrency> => {
  return moneyAmount !== undefined && moneyAmount.amount !== 0
}

export const satAmountDisplay = (amount: number): string => {
  if (amount === 1) {
    return "1 sat"
  }
  return Intl.NumberFormat("en-US").format(amount) + " sats"
}
