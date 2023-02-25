import { gql } from "@apollo/client"
import {
  useCurrencyListQuery,
  useDisplayCurrencyQuery,
  WalletCurrency,
} from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { MoneyAmount, WalletOrDisplayCurrency } from "@app/types/amounts"
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
    }
  }
`

export const useDisplayCurrency = () => {
  const isAuthed = useIsAuthed()
  const { data: dataCurrencyList } = useCurrencyListQuery({ skip: !isAuthed })

  const { data } = useDisplayCurrencyQuery({ skip: !isAuthed })
  const displayCurrency = data?.me?.defaultAccount?.displayCurrency || "USD"

  const currencyList = useMemo(
    () => dataCurrencyList?.currencyList || [],
    [dataCurrencyList],
  )

  const formatToDisplayCurrency = useCallback(
    (amount: number) => {
      return Intl.NumberFormat("en-US", {
        style: "currency",
        currency: displayCurrency,
      }).format(amount)
    },
    [displayCurrency],
  )

  const fiatSymbol = useMemo(
    () => currencyList.find((currency) => currency.id === displayCurrency)?.symbol ?? "$",
    [currencyList, displayCurrency],
  )

  // FIXME this should come from the backend and should be used in currency inputs
  const minorUnitToMajorUnitOffset = 2

  const moneyAmountToMajorUnitOrSats = (
    moneyAmount: MoneyAmount<WalletOrDisplayCurrency>,
  ) => {
    return moneyAmount.currency === WalletCurrency.Btc
      ? moneyAmount.amount
      : moneyAmount.amount / 10 ** minorUnitToMajorUnitOffset
  }

  const moneyAmountToTextWithUnits = useCallback(
    (moneyAmount: MoneyAmount<WalletOrDisplayCurrency>): string => {
      if (moneyAmount.currency === WalletCurrency.Btc) {
        if (moneyAmount.amount === 1) {
          return "1 sat"
        }
        return moneyAmountToText(moneyAmount, minorUnitToMajorUnitOffset) + " sats"
      }

      return fiatSymbol + moneyAmountToText(moneyAmount, minorUnitToMajorUnitOffset)
    },
    [fiatSymbol],
  )

  return {
    minorUnitToMajorUnitOffset,
    formatToDisplayCurrency,
    fiatSymbol,
    moneyAmountToTextWithUnits,
    moneyAmountToMajorUnitOrSats,
  }
}

const moneyAmountToText = (
  moneyAmount: MoneyAmount<WalletOrDisplayCurrency>,
  minorUnitToMajorUnitOffset: number,
  locale = "en-US",
): string => {
  if (moneyAmount.currency === WalletCurrency.Btc) {
    return moneyAmount.amount.toLocaleString(locale, {
      style: "decimal",
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    })
  }
  return (moneyAmount.amount / 10 ** minorUnitToMajorUnitOffset).toLocaleString(locale, {
    style: "decimal",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })
}
