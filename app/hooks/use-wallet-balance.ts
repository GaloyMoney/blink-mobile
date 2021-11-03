import { ApolloClient } from "@apollo/client"
import useToken from "../utils/use-token"
import { getBtcWallet } from "../graphql/query"
import { usePriceConversions } from "./currency-hooks"

export const useWalletBalance = (
  client: ApolloClient<unknown>,
): {
  satBalance: number
  usdBalance: number | string
} => {
  const { convertCurrencyAmount } = usePriceConversions()
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

  return {
    satBalance,
    usdBalance,
  }
}
