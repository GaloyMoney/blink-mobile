import { ApolloClient } from "@apollo/client"
import _ from "lodash"
import { getWallet } from "../graphql/query"
import { useBTCPrice } from "./usePrice"

export const useUSDBalance = (client: ApolloClient<unknown>): number => {
  const btcPrice = useBTCPrice()
  return _.find(getWallet(client), { id: "BTC" }).balance * btcPrice
}
