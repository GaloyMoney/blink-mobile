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

export type CurrencyInfo = {
  currencyCode: string
  symbol: string
  minorUnitToMajorUnitOffset: number
  showFractionDigits: boolean
}

const usdDisplayCurrency = {
  symbol: "$",
  id: "USD",
  fractionDigits: 2,
}

const defaultDisplayCurrency = usdDisplayCurrency

const formatCurrencyHelper = ({
  amountInMajorUnits,
  symbol,
  isApproximate,
  fractionDigits,
  withSign = true,
  currencyCode,
}: {
  amountInMajorUnits: number | string
  isApproximate?: boolean
  symbol?: string
  fractionDigits: number
  currencyCode?: string
  withSign?: boolean
}) => {
  const isNegative = Number(amountInMajorUnits) < 0
  const decimalPlaces = fractionDigits
  const amountStr = Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
    // FIXME this workaround of using .format and not .formatNumber is
    // because hermes haven't fully implemented Intl.NumberFormat yet
  }).format(Math.abs(Number(amountInMajorUnits)))
  return `${isApproximate ? "~ " : ""}${
    isNegative && withSign ? "-" : ""
  }${symbol}${amountStr}${currencyCode ? ` ${currencyCode}` : ""}`
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

  const moneyAmountToMajorUnitOrSats = useCallback(
    (moneyAmount: MoneyAmount<WalletOrDisplayCurrency>) => {
      switch (moneyAmount.currency) {
        case WalletCurrency.Btc:
          return moneyAmount.amount
        case WalletCurrency.Usd:
          return moneyAmount.amount / 100
        case DisplayCurrency:
          return moneyAmount.amount / 10 ** displayCurrencyInfo.fractionDigits
      }
    },
    [displayCurrencyInfo],
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
            amount: Math.round(amount * 10 ** displayCurrencyInfo.fractionDigits),
            currency,
          }
      }
    },
    [displayCurrencyInfo],
  )

  const displayCurrencyShouldDisplayDecimals = displayCurrencyHasSignificantMinorUnits({
    convertMoneyAmount,
    amountInMajorUnitOrSatsToMoneyAmount,
  })

  const currencyInfo: Record<WalletOrDisplayCurrency, CurrencyInfo> = useMemo(() => {
    return {
      [WalletCurrency.Usd]: {
        symbol: usdDisplayCurrency.symbol,
        minorUnitToMajorUnitOffset: usdDisplayCurrency.fractionDigits,
        showFractionDigits: true,
        currencyCode: usdDisplayCurrency.id,
      },
      [WalletCurrency.Btc]: {
        symbol: "",
        minorUnitToMajorUnitOffset: 0,
        showFractionDigits: false,
        currencyCode: "SAT",
      },
      [DisplayCurrency]: {
        symbol: displayCurrencyInfo.symbol,
        minorUnitToMajorUnitOffset: displayCurrencyInfo.fractionDigits,
        showFractionDigits: displayCurrencyShouldDisplayDecimals,
        currencyCode: displayCurrencyInfo.id,
      },
    }
  }, [displayCurrencyInfo, displayCurrencyShouldDisplayDecimals])

  const formatCurrency = useCallback(
    ({
      amountInMajorUnits,
      currency,
      withSign,
      currencyCode,
    }: {
      amountInMajorUnits: number | string
      currency: string
      withSign?: boolean
      currencyCode?: string
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
        currencyCode,
      })
    },
    [displayCurrencyDictionary],
  )

  const formatMoneyAmount = useCallback(
    ({
      moneyAmount,
      noSymbol = false,
      noSuffix = false,
      isApproximate = false,
    }: {
      moneyAmount: MoneyAmount<WalletOrDisplayCurrency>
      noSymbol?: boolean
      noSuffix?: boolean
      isApproximate?: boolean
    }): string => {
      const amount = moneyAmountToMajorUnitOrSats(moneyAmount)

      const { symbol, minorUnitToMajorUnitOffset, showFractionDigits, currencyCode } =
        currencyInfo[moneyAmount.currency]

      return formatCurrencyHelper({
        amountInMajorUnits: amount,
        isApproximate,
        symbol: noSymbol ? "" : symbol,
        fractionDigits: showFractionDigits ? minorUnitToMajorUnitOffset : 0,
        currencyCode:
          moneyAmount.currency === WalletCurrency.Btc && !noSuffix
            ? currencyCode
            : undefined,
      })
    },
    [currencyInfo, moneyAmountToMajorUnitOrSats],
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
        return `${formatMoneyAmount({
          moneyAmount: primaryAmountWithDefault,
        })} (${formatMoneyAmount({
          moneyAmount: secondaryAmount,
        })})`
      }

      return formatMoneyAmount({ moneyAmount: primaryAmountWithDefault })
    },
    [getSecondaryAmountIfCurrencyIsDifferent, formatMoneyAmount],
  )

  const moneyAmountToDisplayCurrencyString = useCallback(
    (moneyAmount: MoneyAmount<WalletOrDisplayCurrency>): string | undefined => {
      if (!convertMoneyAmount) {
        return undefined
      }
      return formatMoneyAmount({
        moneyAmount: convertMoneyAmount(moneyAmount, DisplayCurrency),
      })
    },
    [convertMoneyAmount, formatMoneyAmount],
  )

  return {
    fractionDigits: displayCurrencyInfo.fractionDigits,
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
    currencyInfo,

    formatCurrency,
  }
}
