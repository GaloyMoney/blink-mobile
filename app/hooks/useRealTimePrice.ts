import * as React from "react"

// hooks
import { useQuery, useSubscription } from "@apollo/client"
import { useDisplayCurrency } from "./use-display-currency"

// gql
import { RealtimePriceSubscription } from "@app/graphql/front-end-subscriptions"
import { RealtimePrice } from "@app/graphql/front-end-queries"

export const useRealTimePrice = () => {
  const priceRef = React.useRef<number>(0)
  const { formatCurrency, displayCurrency, fractionDigits } = useDisplayCurrency()

  const { loading: initLoading } = useQuery(RealtimePrice, {
    variables: { currency: displayCurrency },
    onCompleted(initData) {
      if (initData?.realtimePrice?.btcSatPrice) {
        const { base, offset } = initData.realtimePrice.btcSatPrice
        priceRef.current = base / 10 ** offset
      }
    },
  })

  const { loading } = useSubscription(RealtimePriceSubscription, {
    variables: { currency: displayCurrency },
    onData({ data }) {
      if (data?.data?.realtimePrice?.realtimePrice?.btcSatPrice) {
        const { base, offset } = data.data.realtimePrice.realtimePrice.btcSatPrice
        priceRef.current = base / 10 ** offset
      }
    },
  })

  const conversions = React.useMemo(
    () => ({
      satsToCurrency: (sats: number) => {
        const convertedCurrencyAmount =
          fractionDigits === 2 ? (sats * priceRef.current) / 100 : sats * priceRef.current
        const formattedCurrency = formatCurrency({
          amountInMajorUnits: convertedCurrencyAmount,
          currency: displayCurrency,
          withSign: true,
        })
        return {
          convertedCurrencyAmount,
          formattedCurrency,
        }
      },
      currencyToSats: (currencyAmount: number) => {
        const convertedCurrencyAmount =
          fractionDigits === 2
            ? (100 * currencyAmount) / priceRef.current
            : currencyAmount / priceRef.current
        const formattedCurrency = formatCurrency({
          amountInMajorUnits: convertedCurrencyAmount,
          currency: displayCurrency,
          withSign: true,
        })
        return {
          convertedCurrencyAmount,
          formattedCurrency,
        }
      },
      loading: loading || initLoading,
    }),
    [priceRef, formatCurrency, loading, initLoading, displayCurrency],
  )

  if (priceRef.current === 0) {
    return {
      satsToCurrency: () => {
        return {
          convertedCurrencyAmount: NaN,
          formattedCurrency: "0",
        }
      },
      currencyToSats: () => {
        return {
          convertedCurrencyAmount: NaN,
          formattedCurrency: "0",
        }
      },
      loading: loading || initLoading,
    }
  }

  return conversions
}
