import { ApolloClient } from "@apollo/client"
import { useBTCPrice } from "./use-btc-price"
import useToken from "../utils/use-token"
import { getBtcWallet } from "../graphql/query"

export const useWalletBalance = (
  client: ApolloClient<unknown>,
): {
  satBalance: number
  usdBalance: number
} => {
  const { btcPrice } = useBTCPrice()
  const { hasToken } = useToken()

  let satBalance = 0
  let usdBalance = 0

  if (hasToken) {
    const wallet = getBtcWallet(client, { hasToken })
    if (wallet) {
      satBalance = wallet.balance
      usdBalance = satBalance * btcPrice
    }
  }

  return {
    satBalance,
    usdBalance,
  }
}
