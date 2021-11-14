import { gql, useApolloClient, useReactiveVar, useSubscription } from "@apollo/client"
import * as React from "react"

import {
  PRICE_CACHE,
  prefCurrencyVar as primaryCurrencyVar,
} from "../graphql/client-only-query"

type UseMyUpdates = {
  convertCurrencyAmount: (arg0: {
    amount: number
    from: CurrencyType
    to: CurrencyType
  }) => number
  formatCurrencyAmount: (arg0: { sats: number; currency: CurrencyType }) => string
  usdPerSat: string
  lnInvoiceStatus: {
    paymentHash: string
    status: string
    balance: number
  } | null
}

const ME_SUBSCRIPTION = gql`
  subscription ME {
    me {
      errors {
        message
      }
      data {
        type: __typename
        ... on Price {
          base
          offset
          currencyUnit
          formattedAmount
        }
        ... on InvoiceStatus {
          paymentHash
          status
          balance
        }
      }
    }
  }
`

// Private custom hook to get the initial price from cache (if set)
// in case the subscription failed to provide an initial price
const usePriceCache = () => {
  const client = useApolloClient()
  const [cachedPrice] = React.useState(() => {
    const lastPriceData = client.readQuery({
      query: PRICE_CACHE,
    })
    return lastPriceData?.price ?? 0
  })

  const updatePriceCache = (newPrice) => {
    client.writeQuery({
      query: PRICE_CACHE,
      data: { price: newPrice },
    })
  }

  return [cachedPrice, updatePriceCache]
}

export const formatUsdAmount: (usd: number) => string = (usd) => {
  if (usd === 0 || usd >= 0.01) {
    return usd.toFixed(2)
  }
  return usd.toFixed(4)
}

export const useMyCurrencies = (): {
  primaryCurrency: CurrencyType
  secondaryCurrency: CurrencyType
  toggleCurrency: () => void
} => {
  // TODO: cache selected primary currenncy
  const primaryCurrency = useReactiveVar<CurrencyType>(primaryCurrencyVar)
  const secondaryCurrency = primaryCurrency === "BTC" ? "USD" : "BTC"
  const toggleCurrency = () => primaryCurrencyVar(secondaryCurrency)

  return { primaryCurrency, secondaryCurrency, toggleCurrency }
}

export const useMySubscription = (): UseMyUpdates => {
  const [cachedPrice, updatePriceCach] = usePriceCache()
  const priceRef = React.useRef<number>(cachedPrice)
  const lnInvoiceStatusRef = React.useRef<UseMyUpdates["lnInvoiceStatus"]>(null)
  const { data } = useSubscription(ME_SUBSCRIPTION)

  const noPriceData = priceRef.current === 0

  const convertCurrencyAmount = React.useCallback(
    ({ amount, from, to }) => {
      if (noPriceData) {
        return NaN
      }
      if (from === "BTC" && to === "USD") {
        return (amount * priceRef.current) / 100
      }
      if (from === "USD" && to === "BTC") {
        return (100 * amount) / priceRef.current
      }
      return amount
    },
    [noPriceData],
  )

  const formatCurrencyAmount = React.useCallback(
    ({ sats, currency }) => {
      if (currency === "BTC") {
        if (sats === 1) {
          return "1 sat"
        }
        return `${sats.toFixed(0)} sats`
      }
      if (currency === "USD") {
        if (noPriceData) {
          return "??"
        }
        return `$${formatUsdAmount((sats * priceRef.current) / 100)}`
      }
      throw new Error("Unsupported currency")
    },
    [noPriceData],
  )

  if (data?.me?.data) {
    if (data.me.data.type === "Price") {
      const { base, offset } = data.me.data
      priceRef.current = base / 10 ** offset
      updatePriceCach(priceRef.current)
    }
    if (data.me.data.type === "InvoiceStatus") {
      lnInvoiceStatusRef.current = data.me.data
    }
  }

  return {
    convertCurrencyAmount,
    formatCurrencyAmount,
    usdPerSat: (priceRef.current / 100).toFixed(8),
    lnInvoiceStatus: lnInvoiceStatusRef.current,
  }
}
