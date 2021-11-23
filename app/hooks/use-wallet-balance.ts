import { useQuery } from "@apollo/client"
import useToken from "../utils/use-token"
import { MAIN_QUERY } from "../graphql/query"
import { useMySubscription } from "./user-hooks"

export const useWalletBalance = (): {
  walletId?: string
  satBalance: number
  usdBalance: number | string
} => {
  const { convertCurrencyAmount, currentBalance } = useMySubscription()
  const { hasToken } = useToken()

  const { data, refetch } = useQuery(MAIN_QUERY, {
    variables: { hasToken },
    fetchPolicy: "cache-only",
  })

  const wallet = data?.me?.defaultAccount?.wallets?.[0]

  if (!wallet) {
    return {
      satBalance: 0,
      usdBalance: 0,
    }
  }

  let satBalance = wallet.balance

  if (currentBalance && currentBalance !== satBalance) {
    satBalance = currentBalance
    refetch()
  }

  return {
    walletId: wallet.id,
    satBalance,
    usdBalance:
      satBalance > 0
        ? convertCurrencyAmount({ amount: satBalance, from: "BTC", to: "USD" })
        : 0,
  }
}
