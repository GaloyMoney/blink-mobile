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
  const { convertCurrencyAmount, lnInvoiceStatus } = useMySubscription()
  const { hasToken } = useToken()

  let satBalance = 0
  let usdBalance = 0

  if (hasToken) {
    const wallet = getBtcWallet(client, { hasToken })
    if (wallet) {
      satBalance = wallet.balance
      usdBalance = convertCurrencyAmount({ amount: satBalance, from: "BTC", to: "USD" })
    }
  }

  if (lnInvoiceStatus?.balance) {
    satBalance = lnInvoiceStatus?.balance
    usdBalance = convertCurrencyAmount({ amount: satBalance, from: "BTC", to: "USD" })
    // Update the cached recent transactions list
    client.query({
      query: TRANSACTIONS_LIST,
      variables: { first: 3 },
      fetchPolicy: "network-only",
    })
  }

  return {
    satBalance,
    usdBalance,
  }
}
