import { unixTime } from "../utils/date"
import { useMemo } from "react"
import moment from "moment"

type BTCPriceReturn = {
  btcPrice: number
  priceIsStale: boolean
  timeSinceLastPriceUpdate: {
    minutes: number
    hours: number
  }
  updateStalePrice: () => void
}

export const MAXIMUM_PRICE_STALENESS_SECONDS = 300

export const useBTCPrice = (): BTCPriceReturn => {
  // const { data, refetch } = useQuery<prices>(QUERY_PRICE)
  const data = {
    prices: [
      {
        id: moment().unix().toString(),
        o: 0.0003966375,
      },
    ],
  }

  const priceTimestamp: number | typeof NaN = parseInt(data?.prices?.[0]?.id ?? "")
  const secondsSinceLastPriceUpdate: number | typeof NaN = unixTime() - priceTimestamp
  const priceIsStale = secondsSinceLastPriceUpdate > MAXIMUM_PRICE_STALENESS_SECONDS

  return useMemo(() => {
    return {
      btcPrice: data?.prices?.[0]?.o ?? NaN,
      priceIsStale,
      timeSinceLastPriceUpdate: {
        hours: Math.floor(secondsSinceLastPriceUpdate / 3600),
        minutes: Math.floor(secondsSinceLastPriceUpdate / 60),
      },
      updateStalePrice: () => {
        if (priceIsStale) {
          // refetch()
        }
      },
    }
  }, [priceIsStale, secondsSinceLastPriceUpdate])
}
