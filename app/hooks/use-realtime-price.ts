import { WatchQueryFetchPolicy } from "@apollo/client"
import { useDisplayCurrencyQuery, useRealtimePriceQuery } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"

export const useRealtimePriceWrapper = (
  {
    fetchPolicy,
    pollInterval,
    skip,
  }: {
    fetchPolicy?: WatchQueryFetchPolicy
    pollInterval?: number | undefined
    skip?: boolean | undefined
  } = {
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
    skip: !isAuthed || !displayCurrency || Boolean(skip),
    pollInterval,
    // FIXME: using ?? "USD" so that typescript is happy,
    // but we should not call useRealtimePrice until we have the displayCurrency
    // that said, this might only be impactful when using the MockedProvider
    variables: { currency: displayCurrency ?? "USD" },
  })
}
