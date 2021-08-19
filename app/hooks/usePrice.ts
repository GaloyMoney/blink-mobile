import { useQuery } from "@apollo/client"
import { QUERY_PRICE } from "../graphql/query"
import { prices } from "../graphql/__generated__/prices"

export const useBTCPrice = (): number => {
  const { data } = useQuery<prices>(QUERY_PRICE)
  return data?.prices?.[0]?.o ?? NaN
}
