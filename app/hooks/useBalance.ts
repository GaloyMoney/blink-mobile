import { ApolloClient } from "@apollo/client"
import find from "lodash.find"
import { getWallet } from "../graphql/query"
import { useBTCPrice } from "./usePrice"

export const useUSDBalance = (client: ApolloClient<unknown>): number => {
  const btcPrice = useBTCPrice()
  return find(getWallet(client), { id: "BTC" }).balance * btcPrice
}
