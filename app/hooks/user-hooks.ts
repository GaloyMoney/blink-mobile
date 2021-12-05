import { gql, useApolloClient, useReactiveVar, useSubscription } from "@apollo/client"
import * as React from "react"
import * as currency_fmt from "currency.js"

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
  usdPerSat: string | null
  currentBalance: number | null
  intraLedgerUpdate: {
    txNotificationType: string
    amount: number
    usdPerSat: number
  }
  lnUpdate: {
    paymentHash: string
    status: string
  }
  onChainUpdate: {
    txNotificationType: string
    txHash: string
    amount: number
    usdPerSat: number
  }
  mySubscriptionLoading: boolean
}

const MY_UPDATES_SUBSCRIPTION = gql`
  subscription myUpdates {
    myUpdates {
      errors {
        message
      }
      me {
        id
        defaultAccount {
          id
          wallets {
            id
            walletCurrency
            balance
          }
        }
      }
      update {
        type: __typename
        ... on Price {
          base
          offset
          currencyUnit
          formattedAmount
        }
        ... on LnUpdate {
          paymentHash
          status
        }
        ... on OnChainUpdate {
          txNotificationType
          txHash
          amount
          usdPerSat
        }
        ... on IntraLedgerUpdate {
          txNotificationType
          amount
          usdPerSat
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
    const lastPriceData = client.readQuery({ query: PRICE_CACHE })
    return lastPriceData?.price ?? 0
  })

  const updatePriceCache = (newPrice) => {
    client.writeQuery({ query: PRICE_CACHE, data: { price: newPrice } })
  }

  return [cachedPrice, updatePriceCache]
}

export const formatCurrencyAmount: (currency: number) => string = (currency) => {
  if (currency === 0 || currency >= 0.01) {
    return currency_fmt
      .default(currency, {
        precision: 2,
        separator: ",",
        symbol: "₡",
        decimal: ".",
      })
      .format()
  }
  return currency.toFixed(4)
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
  const { data, loading } = useSubscription(MY_UPDATES_SUBSCRIPTION)

  const [cachedPrice, updatePriceCach] = usePriceCache()

  const priceRef = React.useRef<number>(cachedPrice)
  const intraLedgerUpdate = React.useRef<UseMyUpdates["intraLedgerUpdate"]>(null)
  const lnUpdate = React.useRef<UseMyUpdates["lnUpdate"]>(null)
  const onChainUpdate = React.useRef<UseMyUpdates["onChainUpdate"]>(null)

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
      if (currency === "CRC") {
        if (noPriceData) {
          return "??"
        }
        return `₡${formatCurrencyAmount((sats * priceRef.current) / 100)}`
      }
      throw new Error("Unsupported currency")
    },
    [noPriceData],
  )

  if (data?.myUpdates?.update) {
    if (data.myUpdates.update.type === "Price") {
      const { base, offset } = data.myUpdates.update
      priceRef.current = base / 10 ** offset
      updatePriceCach(priceRef.current)
    }
    if (data.myUpdates.update.type === "IntraLedgerUpdate") {
      intraLedgerUpdate.current = data.myUpdates.update
    }
    if (data.myUpdates.update.type === "LnUpdate") {
      lnUpdate.current = data.myUpdates.update
    }
    if (data.myUpdates.update.type === "OnChainUpdate") {
      onChainUpdate.current = data.myUpdates.update
    }
  }

  return {
    convertCurrencyAmount,
    formatCurrencyAmount,
    usdPerSat: priceRef.current === 0 ? null : (priceRef.current / 100).toFixed(8),
    currentBalance: data?.myUpdates?.me?.defaultAccount?.wallets?.[0]?.balance,
    intraLedgerUpdate: intraLedgerUpdate.current,
    lnUpdate: lnUpdate.current,
    onChainUpdate: onChainUpdate.current,
    mySubscriptionLoading: loading,
  }
}
