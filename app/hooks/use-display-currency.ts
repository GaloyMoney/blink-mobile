import { gql } from "@apollo/client"
import { useDisplayCurrencyQuery } from "@app/graphql/generated"
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
`

export const useDisplayCurrency = () => {
  const { data } = useDisplayCurrencyQuery()
  const displayCurrency = data?.me?.defaultAccount?.displayCurrency || "USD"

  const formatToDisplayCurrency = useCallback(
    (amount: number) => {
      return Intl.NumberFormat("en-US", {
        style: "currency",
        currency: displayCurrency,
      }).format(amount)
    },
    [displayCurrency],
  )

  return {
    formatToDisplayCurrency,
  }
}
