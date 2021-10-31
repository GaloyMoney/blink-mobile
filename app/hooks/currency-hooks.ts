import { gql, useApolloClient, useReactiveVar, useSubscription } from "@apollo/client"
import * as React from "react"

import {
  PRICE_CACHE,
  prefCurrencyVar as primaryCurrencyVar,
} from "../graphql/client-only-query"

type UsePriceConversions = {
  convertCurrencyAmount: (arg0: {
    amount: number
    from: CurrencyType
    to: CurrencyType
  }) => number
  formatCurrencyAmount: (arg0: { sats: number; currency: CurrencyType }) => string
  usdPerSat: string
}

const PRICE_SUBSCRIPTION = gql`
  subscription price(
    $amount: SatAmount!
    $amountCurrencyUnit: ExchangeCurrencyUnit!
    $priceCurrencyUnit: ExchangeCurrencyUnit!
  ) {
    price(
      input: {
        amount: $amount
        amountCurrencyUnit: $amountCurrencyUnit
        priceCurrencyUnit: $priceCurrencyUnit
      }
    ) {
      errors {
        message
      }
      price {
        base
        offset
        currencyUnit
        formattedAmount
      }
    }
  }
`

export const formatUsdAmount: (usd: number) => string = (usd) => {
  if (usd === 0 || usd >= 0.01) {
    return usd.toFixed(2)
  }
  return usd.toFixed(4)
}

export const useCurrencies = (): {
  primaryCurrency: CurrencyType
  secondaryCurrency: CurrencyType
  toggleCurrency: () => void
} => {
  const primaryCurrency = useReactiveVar<CurrencyType>(primaryCurrencyVar)
  const secondaryCurrency = primaryCurrency === "BTC" ? "USD" : "BTC"
  const toggleCurrency = () => primaryCurrencyVar(secondaryCurrency)

  return { primaryCurrency, secondaryCurrency, toggleCurrency }
}

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

export const usePriceConversions = (): UsePriceConversions => {
  const [cachedPrice, updatePriceCach] = usePriceCache()
  const priceRef = React.useRef<number>(cachedPrice)
  const { data } = useSubscription(PRICE_SUBSCRIPTION, {
    variables: {
      amount: 1,
      amountCurrencyUnit: "BTCSAT",
      priceCurrencyUnit: "USDCENT",
    },
  })

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

  if (data?.price?.price) {
    const { base, offset } = data.price.price
    priceRef.current = base / 10 ** offset
    updatePriceCach(priceRef.current)
  }

  return {
    convertCurrencyAmount,
    formatCurrencyAmount,
    usdPerSat: (priceRef.current / 100).toFixed(8),
  }
}
