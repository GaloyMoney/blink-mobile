import { gql } from "@apollo/client"
import {
  useCurrencyListQuery,
  useRealtimePriceQuery,
  WalletCurrency,
} from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { DisplayCurrency, MoneyAmount, WalletOrDisplayCurrency } from "@app/types/amounts"
import { useCallback, useMemo } from "react"

gql`
  query displayCurrency {
    me {
      id
      defaultAccount {
        id
        displayCurrency
      }
    }
  }

  query currencyList {
    currencyList {
      __typename
      id
      flag
      name
      symbol
      fractionDigits
    }
  }
`

const usdDisplayCurrency = {
  symbol: "$",
  id: "USD",
  fractionDigits: 2,
}

const defaultDisplayCurrency = usdDisplayCurrency

const formatCurrencyHelper = ({
  amountInMajorUnits,
  symbol,
  fractionDigits,
  withSign = true,
}: {
  amountInMajorUnits: number | string
  symbol: string
  fractionDigits: number
  withSign?: boolean
}) => {
  const isNegative = Number(amountInMajorUnits) < 0
  const amountStr = Intl.NumberFormat("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
    // FIXME this workaround of using .format and not .formatNumber is
    // because hermes haven't fully implemented Intl.NumberFormat yet
  }).format(Math.abs(Number(amountInMajorUnits)))
  return `${isNegative && withSign ? "-" : ""}${symbol}${amountStr}`
}

export const useDisplayCurrency = () => {
  const isAuthed = useIsAuthed()
  const { data: dataCurrencyList } = useCurrencyListQuery({ skip: !isAuthed })
  const { data } = useRealtimePriceQuery({ skip: !isAuthed })

  const displayCurrency =
    data?.me?.defaultAccount?.realtimePrice?.denominatorCurrency ||
    defaultDisplayCurrency.id

  const displayCurrencyDictionary = useMemo(() => {
    const currencyList = dataCurrencyList?.currencyList || []
    return currencyList.reduce((acc, currency) => {
      acc[currency.id] = currency
      return acc
    }, {} as Record<string, typeof defaultDisplayCurrency>)
  }, [dataCurrencyList?.currencyList])

  const displayCurrencyInfo =
    displayCurrencyDictionary[displayCurrency] || defaultDisplayCurrency

  const fractionDigits = displayCurrencyInfo.fractionDigits

  const formatToDisplayCurrency = useCallback(
    (amountInMajorUnits: number) =>
      formatCurrencyHelper({
        amountInMajorUnits,
        symbol: displayCurrencyInfo.symbol,
        fractionDigits: displayCurrencyInfo.fractionDigits,
      }),
    [displayCurrencyInfo],
  )

  const moneyAmountToMajorUnitOrSats = useCallback(
    (moneyAmount: MoneyAmount<WalletOrDisplayCurrency>) => {
      switch (moneyAmount.currency) {
        case WalletCurrency.Btc:
          return moneyAmount.amount
        case WalletCurrency.Usd:
          return moneyAmount.amount / 100
        case DisplayCurrency:
          return moneyAmount.amount / 10 ** fractionDigits
      }
    },
    [fractionDigits],
  )

  const amountInMajorUnitOrSatsToMoneyAmount = useCallback(
    (
      amount: number,
      currency: WalletOrDisplayCurrency,
    ): MoneyAmount<WalletOrDisplayCurrency> => {
      switch (currency) {
        case WalletCurrency.Btc:
          return {
            amount: Math.round(amount),
            currency,
          }
        case WalletCurrency.Usd:
          return {
            amount: Math.round(amount * 100),
            currency,
          }
        case DisplayCurrency:
          return {
            amount: Math.round(amount * 10 ** fractionDigits),
            currency,
          }
      }
    },
    [fractionDigits],
  )

  const formatMoneyAmount = useCallback(
    (moneyAmount: MoneyAmount<WalletOrDisplayCurrency>): string => {
      if (moneyAmount.currency === WalletCurrency.Btc) {
        if (moneyAmount.amount === 1) {
          return "1 sat"
        }
        return (
          moneyAmount.amount.toLocaleString("en-US", {
            style: "decimal",
            maximumFractionDigits: 0,
            minimumFractionDigits: 0,
          }) + " sats"
        )
      }

      const amount = moneyAmountToMajorUnitOrSats(moneyAmount)
      const { fractionDigits, symbol } =
        moneyAmount.currency === WalletCurrency.Usd
          ? usdDisplayCurrency
          : displayCurrencyInfo
      return formatCurrencyHelper({ amountInMajorUnits: amount, symbol, fractionDigits })
    },
    [displayCurrencyInfo, moneyAmountToMajorUnitOrSats],
  )

  const formatCurrency = useCallback(
    ({
      amountInMajorUnits,
      currency,
      withSign,
    }: {
      amountInMajorUnits: number | string
      currency: string
      withSign?: boolean
    }) => {
      const currencyInfo = displayCurrencyDictionary[currency] || {
        symbol: currency,
        fractionDigits: 2,
      }
      return formatCurrencyHelper({
        amountInMajorUnits,
        symbol: currencyInfo.symbol,
        fractionDigits: currencyInfo.fractionDigits,
        withSign,
      })
    },
    [displayCurrencyDictionary],
  )

  return {
    fractionDigits,
    formatToDisplayCurrency,
    fiatSymbol: displayCurrencyInfo.symbol,
    formatMoneyAmount,
    moneyAmountToMajorUnitOrSats,
    amountInMajorUnitOrSatsToMoneyAmount,
    formatCurrency,
    displayCurrency,
  }
}
