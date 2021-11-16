import { ApolloClient } from "@apollo/client"
import useToken from "../utils/use-token"
import { getBtcWallet, TRANSACTIONS_LIST } from "../graphql/query"
import { useMySubscription } from "./user-hooks"

export const useWalletBalance = (
  client: ApolloClient<unknown>,
): {
  satBalance: number
  usdBalance: number | string
} => {
  const { convertCurrencyAmount, currentBalance } = useMySubscription()
  const { hasToken } = useToken()

  let satBalance = 0

  if (hasToken) {
    const wallet = getBtcWallet(client, { hasToken })
    if (wallet) {
      satBalance = wallet.balance
    }
  }

  if (currentBalance) {
    satBalance = currentBalance

    // Update the cached recent transactions list
    client.query({
      query: TRANSACTIONS_LIST,
      variables: { first: 3 },
      fetchPolicy: "network-only",
    })
  }

  return {
    satBalance,
    usdBalance:
      satBalance > 0
        ? convertCurrencyAmount({ amount: satBalance, from: "BTC", to: "USD" })
        : 0,
  }
}
