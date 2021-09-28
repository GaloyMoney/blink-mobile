import { ApolloClient } from "@apollo/client"
import find from "lodash.find"
import { getWallet } from "../graphql/query"
import { useBTCPrice } from "./use-btc-price"

export const useUSDBalance = (client: ApolloClient<unknown>): number => {
  const btcPrice = useBTCPrice()
  const wallet = getWallet(client)
  if (!wallet) {
    return 0
  }
  return find(wallet, { id: "BTC" }).balance * btcPrice
}
