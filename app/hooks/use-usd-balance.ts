import { ApolloClient } from "@apollo/client"
import { getWallet } from "../graphql/query"
import { useBTCPrice } from "./use-btc-price"

export const useUSDBalance = (client: ApolloClient<unknown>): number => {
  const { btcPrice } = useBTCPrice()
  const wallet = getWallet(client)
  if (!wallet) {
    return 0
  }
  return wallet.find((x) => x.id === "BTC").balance * btcPrice
}
