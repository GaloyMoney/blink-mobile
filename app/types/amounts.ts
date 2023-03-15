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

export const lessThanOrEqualTo = <T extends WalletOrDisplayCurrency>({
  value,
  lessThanOrEqualTo,
}: {
  value: MoneyAmount<T>
  lessThanOrEqualTo: MoneyAmount<T>
}) => {
  return value.amount <= lessThanOrEqualTo.amount
}

export const lessThan = <T extends WalletOrDisplayCurrency>({
  value,
  lessThan,
}: {
  value: MoneyAmount<T>
  lessThan: MoneyAmount<T>
}) => {
  return value.amount < lessThan.amount
}

export const greaterThanOrEqualTo = <T extends WalletOrDisplayCurrency>({
  value,
  greaterThanOrEqualTo,
}: {
  value: MoneyAmount<T>
  greaterThanOrEqualTo: MoneyAmount<T>
}) => {
  return value.amount >= greaterThanOrEqualTo.amount
}

export const addMoneyAmounts = <T extends WalletOrDisplayCurrency>({
  a,
  b,
}: {
  a: MoneyAmount<T>
  b: MoneyAmount<T>
}): MoneyAmount<T> => {
  return {
    amount: a.amount + b.amount,
    currency: a.currency,
  }
}

export const subtractMoneyAmounts = <T extends WalletOrDisplayCurrency>({
  a,
  b,
}: {
  a: MoneyAmount<T>
  b: MoneyAmount<T>
}): MoneyAmount<T> => {
  return {
    amount: a.amount - b.amount,
    currency: a.currency,
  }
}

export const isNonZeroMoneyAmount = (
  moneyAmount: MoneyAmount<WalletOrDisplayCurrency> | undefined,
): moneyAmount is MoneyAmount<WalletOrDisplayCurrency> => {
  return moneyAmount !== undefined && moneyAmount.amount !== 0
}
