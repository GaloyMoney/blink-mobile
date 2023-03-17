import { gql } from "@apollo/client"
import {
  useCurrencyListQuery,
  useRealtimePriceQuery,
  WalletCurrency,
} from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { ConvertMoneyAmount } from "@app/screens/send-bitcoin-screen/payment-details"
import {
  DisplayAmount,
  DisplayCurrency,
  lessThan,
  MoneyAmount,
  WalletAmount,
  WalletOrDisplayCurrency,
} from "@app/types/amounts"
import { useCallback, useMemo } from "react"
import { usePriceConversion } from "./use-price-conversion"

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
  withDecimals = true,
}: {
  amountInMajorUnits: number | string
  symbol: string
  fractionDigits: number
  withSign?: boolean
  withDecimals?: boolean
}) => {
  const isNegative = Number(amountInMajorUnits) < 0
  const decimalPlaces = withDecimals ? fractionDigits : 0
  const amountStr = Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
    // FIXME this workaround of using .format and not .formatNumber is
    // because hermes haven't fully implemented Intl.NumberFormat yet
  }).format(Math.abs(Number(amountInMajorUnits)))
  return `${isNegative && withSign ? "-" : ""}${symbol}${amountStr}`
}

const displayCurrencyHasSignificantMinorUnits = ({
  convertMoneyAmount,
  amountInMajorUnitOrSatsToMoneyAmount,
}: {
  convertMoneyAmount?: ConvertMoneyAmount
  amountInMajorUnitOrSatsToMoneyAmount: (
    amount: number,
    currency: WalletOrDisplayCurrency,
  ) => MoneyAmount<WalletOrDisplayCurrency>
}) => {
  if (!convertMoneyAmount) {
    return true
  }

  const oneMajorUnitOfDisplayCurrency = amountInMajorUnitOrSatsToMoneyAmount(
    1,
    DisplayCurrency,
  )

  const oneUsdCentInDisplayCurrency = convertMoneyAmount(
    {
      amount: 1,
      currency: WalletCurrency.Usd,
    },
    DisplayCurrency,
  )

  return lessThan({
    value: oneUsdCentInDisplayCurrency,
    lessThan: oneMajorUnitOfDisplayCurrency,
  })
}

export const useDisplayCurrency = () => {
  const isAuthed = useIsAuthed()
  const { data: dataCurrencyList } = useCurrencyListQuery({ skip: !isAuthed })
  const { data } = useRealtimePriceQuery({ skip: !isAuthed })
  const { convertMoneyAmount } = usePriceConversion()

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

  const { fractionDigits } = displayCurrencyInfo

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

  const displayCurrencyShouldDisplayDecimals = displayCurrencyHasSignificantMinorUnits({
    convertMoneyAmount,
    amountInMajorUnitOrSatsToMoneyAmount,
  })

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

      if (moneyAmount.currency === WalletCurrency.Usd) {
        return formatCurrencyHelper({
          amountInMajorUnits: amount,
          symbol: usdDisplayCurrency.symbol,
          fractionDigits: usdDisplayCurrency.fractionDigits,
        })
      }

      return formatCurrencyHelper({
        amountInMajorUnits: amount,
        symbol: displayCurrencyInfo.symbol,
        fractionDigits: displayCurrencyInfo.fractionDigits,
        withDecimals: displayCurrencyShouldDisplayDecimals,
      })
    },
    [
      displayCurrencyInfo,
      moneyAmountToMajorUnitOrSats,
      displayCurrencyShouldDisplayDecimals,
    ],
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

  const getSecondaryAmountIfCurrencyIsDifferent = useCallback(
    ({
      primaryAmount,
      displayAmount,
      walletAmount,
    }: {
      primaryAmount: MoneyAmount<WalletOrDisplayCurrency>
      displayAmount: DisplayAmount
      walletAmount: WalletAmount<WalletCurrency>
    }) => {
      // if the display currency is the same as the wallet amount currency, we don't need to show the secondary amount (example: USD display currency with USD wallet amount)
      if (walletAmount.currency === displayCurrency) {
        return undefined
      }

      if (primaryAmount.currency === DisplayCurrency) {
        return walletAmount
      }

      return displayAmount
    },
    [displayCurrency],
  )

  const formatDisplayAndWalletAmount = useCallback(
    ({
      primaryAmount,
      displayAmount,
      walletAmount,
    }: {
      primaryAmount?: MoneyAmount<WalletOrDisplayCurrency>
      displayAmount: DisplayAmount
      walletAmount: WalletAmount<WalletCurrency>
    }) => {
      // if the primary amount is not provided, we use the display amount as the primary amount by default
      const primaryAmountWithDefault = primaryAmount || displayAmount

      const secondaryAmount = getSecondaryAmountIfCurrencyIsDifferent({
        primaryAmount: primaryAmountWithDefault,
        displayAmount,
        walletAmount,
      })

      if (secondaryAmount) {
        return `${formatMoneyAmount(primaryAmountWithDefault)} (${formatMoneyAmount(
          secondaryAmount,
        )})`
      }

      return formatMoneyAmount(primaryAmountWithDefault)
    },
    [getSecondaryAmountIfCurrencyIsDifferent, formatMoneyAmount],
  )

  const moneyAmountToDisplayCurrencyString = useCallback(
    (moneyAmount: MoneyAmount<WalletOrDisplayCurrency>): string | undefined => {
      if (!convertMoneyAmount) {
        return undefined
      }
      return formatMoneyAmount(convertMoneyAmount(moneyAmount, "DisplayCurrency"))
    },
    [convertMoneyAmount, formatMoneyAmount],
  )

  return {
    fractionDigits,
    fiatSymbol: displayCurrencyInfo.symbol,
    displayCurrency,

    moneyAmountToMajorUnitOrSats,
    formatMoneyAmount,
    getSecondaryAmountIfCurrencyIsDifferent,
    formatDisplayAndWalletAmount,
    moneyAmountToDisplayCurrencyString,

    // TODO: remove export. we should only accept MoneyAmount instead of number as input
    // for exported functions for consistency
    amountInMajorUnitOrSatsToMoneyAmount,
    displayCurrencyShouldDisplayDecimals,

    formatCurrency,
  }
}
