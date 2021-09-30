import { useQuery } from "@apollo/client"
import { useMemo } from "react"
import { QUERY_PRICE } from "../graphql/query"
import { prices } from "../graphql/__generated__/prices"

type BTCPriceReturn = {
  btcPrice: number
  priceTimestamp: number
}

export const useBTCPrice = (): BTCPriceReturn => {
  const { data } = useQuery<prices>(QUERY_PRICE)
  return useMemo(() => {
    return {
      btcPrice: data?.prices?.[0]?.o ?? NaN,
      priceTimestamp: parseInt(data?.prices?.[0]?.id) ?? NaN,
    }
  }, [data])
}
