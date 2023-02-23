import { gql } from "@apollo/client"
import { useCurrencyListQuery, useDisplayCurrencyQuery } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useCallback } from "react"

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
      code
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

  const currencyList = dataCurrencyList?.currencyList || []

  const formatToDisplayCurrency = useCallback(
    (amount: number) => {
      return Intl.NumberFormat("en-US", {
        style: "currency",
        currency: displayCurrency,
      }).format(amount)
    },
    [displayCurrency],
  )

  const fiatSymbol =
    currencyList.find((currency) => currency.code === displayCurrency)?.symbol ?? "$"

  return {
    formatToDisplayCurrency,
    fiatSymbol,
  }
}
