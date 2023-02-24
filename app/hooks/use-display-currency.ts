import { gql } from "@apollo/client"
import {
  useCurrencyListQuery,
  useDisplayCurrencyQuery,
  WalletCurrency,
} from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { PaymentAmount } from "@app/types/amounts"
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
  const { data } = useDisplayCurrencyQuery({ skip: !isAuthed })
  const { data: dataCurrencyList } = useCurrencyListQuery({ skip: !isAuthed })
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
    () =>
      currencyList.find((currency) => currency.code === displayCurrency)?.symbol ?? "$",
    [currencyList, displayCurrency],
  )

  const paymentAmountToTextWithUnits = useCallback(
    (paymentAmount: PaymentAmount<WalletCurrency>): string => {
      if (paymentAmount.currency === WalletCurrency.Btc) {
        if (paymentAmount.amount === 1) {
          return "1 sat"
        }
        return paymentAmountToText(paymentAmount) + " sats"
      }

      return fiatSymbol + paymentAmountToText(paymentAmount)
    },
    [fiatSymbol],
  )

  return {
    formatToDisplayCurrency,
    fiatSymbol,
    paymentAmountToTextWithUnits,
  }
}

const paymentAmountToText = (
  paymentAmount: PaymentAmount<WalletCurrency>,
  locale = "en-US",
): string => {
  if (paymentAmount.currency === WalletCurrency.Usd) {
    return (paymentAmount.amount / 100).toLocaleString(locale, {
      style: "decimal",
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    })
  }
  return paymentAmount.amount.toLocaleString(locale, {
    style: "decimal",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })
}
