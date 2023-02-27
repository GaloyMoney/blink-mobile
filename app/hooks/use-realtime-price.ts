import { gql, WatchQueryFetchPolicy } from "@apollo/client"
import { useDisplayCurrencyQuery, useRealtimePriceQuery } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useEffect } from "react"

gql`
  query realtimePriceAuthed {
    me {
      defaultAccount {
        realtimePrice {
          btcSatPrice {
            base
            offset
            currencyUnit
          }
          denominatorCurrency
          id
          timestamp
          usdCentPrice {
            base
            offset
            currencyUnit
          }
        }
      }
    }
  }
`

export const useRealtimePriceWrapper = (
  { fetchPolicy }: { fetchPolicy: WatchQueryFetchPolicy } = {
    fetchPolicy: "network-only",
  },
) => {
  const isAuthed = useIsAuthed()

  const { data } = useDisplayCurrencyQuery({
    skip: !isAuthed,
  })

  const res = useRealtimePriceQuery({
    fetchPolicy,
    skip: !isAuthed,
  })

  // TODO: look if this is the most efficient way to refresh on displayCurrency update
  useEffect(() => {
    if (isAuthed && data?.me?.defaultAccount.displayCurrency) {
      res.refetch()
    }
  }, [isAuthed, res, data?.me?.defaultAccount.displayCurrency])

  return res
}
