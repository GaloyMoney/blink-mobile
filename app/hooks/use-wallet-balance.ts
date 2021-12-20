import useToken from "../utils/use-token"
import { MAIN_QUERY } from "../graphql/query"
import { useMySubscription } from "./user-hooks"
import { cacheIdVar } from "../graphql/client-only-query"
import { useApolloClient } from "@apollo/client"

export const useWalletBalance = (): {
  walletId?: string
  satBalance: number
  usdBalance: number | string
  loading: boolean
} => {
  const client = useApolloClient()

  const { convertCurrencyAmount, currentBalance, mySubscriptionLoading } =
    useMySubscription()

  const { hasToken } = useToken()

  if (!hasToken) {
    return {
      satBalance: 0,
      usdBalance: 0,
      loading: false,
    }
  }

  const data = client.readQuery({
    query: MAIN_QUERY,
    variables: { hasToken },
  })

  const wallet = data?.me?.defaultAccount?.wallets?.[0]

  if (!wallet) {
    // If this is thrown, it means Apollo Cache is not able to read the MAIN_QUERY from the cache (because of missing fields)
    throw new Error("Something went wrong")
  }

  let satBalance = wallet.balance

  if (currentBalance && currentBalance !== satBalance) {
    satBalance = currentBalance
    cacheIdVar(Date.now())
  }

  return {
    walletId: wallet.id,
    satBalance,
    usdBalance:
      satBalance > 0
        ? convertCurrencyAmount({ amount: satBalance, from: "BTC", to: "USD" })
        : 0,
    loading: mySubscriptionLoading,
  }
}
