import { WatchQueryFetchPolicy } from "@apollo/client"
import { useDisplayCurrencyQuery, useRealtimePriceQuery } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"

export const useRealtimePriceWrapper = (
  { fetchPolicy }: { fetchPolicy: WatchQueryFetchPolicy } = {
    fetchPolicy: "network-only",
  },
) => {
  const isAuthed = useIsAuthed()

  const { data } = useDisplayCurrencyQuery({
    skip: !isAuthed,
  })
  const displayCurrency = data?.me?.defaultAccount?.displayCurrency

  return useRealtimePriceQuery({
    fetchPolicy,
    skip: !isAuthed || !displayCurrency,
    // FIXME: using ?? "USD" so that typescript is happy,
    // but we should not call useRealtimePrice until we have the displayCurrency
    variables: { currency: displayCurrency ?? "USD" },
  })
}
