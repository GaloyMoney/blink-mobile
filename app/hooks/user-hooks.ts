import {
  gql,
  useApolloClient,
  useQuery,
  useReactiveVar,
  useSubscription,
} from "@apollo/client"
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
  usdPerSat: string | null
  currentUsdWalletBalance: number | null
  currentBtcWalletBalance: number | null
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

const PRICE_QUERY = gql`
  query btcPrice {
    btcPrice {
      base
      offset
      currencyUnit
      formattedAmount
    }
  }
`

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
  const [cachedPrice, setCachedPrice] = React.useState(() => {
    const lastPriceData = client.readQuery({ query: PRICE_CACHE })
    return lastPriceData?.price ?? 0
  })

  const updatePriceCache = (newPrice) => {
    if (cachedPrice !== newPrice) {
      client.writeQuery({ query: PRICE_CACHE, data: { price: newPrice } })
      setCachedPrice(newPrice)
    }
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
  const { data, loading, error } = useSubscription(MY_UPDATES_SUBSCRIPTION)
  const { data: queryData, loading: queryLoading } = useQuery(PRICE_QUERY)
  // console.log("subscription")
  // console.log(data)
  // console.log(loading)
  // console.log(error)

  // console.log("query")
  // console.log(queryData)
  // console.log(queryLoading)

  const [cachedPrice, updatePriceCach] = usePriceCache()

  const intraLedgerUpdate = React.useRef<UseMyUpdates["intraLedgerUpdate"]>(null)
  const lnUpdate = React.useRef<UseMyUpdates["lnUpdate"]>(null)
  const onChainUpdate = React.useRef<UseMyUpdates["onChainUpdate"]>(null)

  const convertCurrencyAmount = React.useCallback(
    ({ amount, from, to }) => {
      if (cachedPrice === 0) {
        return NaN
      }
      if (from === "BTC" && to === "USD") {
        return (amount * cachedPrice) / 100
      }
      if (from === "USD" && to === "BTC") {
        return (100 * amount) / cachedPrice
      }
      return amount
    },
    [cachedPrice],
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
        if (cachedPrice === 0) {
          return "..."
        }
        return `$${formatUsdAmount((sats * cachedPrice) / 100)}`
      }
      throw new Error("Unsupported currency")
    },
    [cachedPrice],
  )

  if (data?.myUpdates?.update) {
    if (data.myUpdates.update.type === "Price") {
      const { base, offset } = data.myUpdates.update
      updatePriceCach(base / 10 ** offset)
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

  const btcWalletBalance = data?.myUpdates?.me?.defaultAccount?.wallets?.find(
    (wallet) => wallet?.__typename === "BTCWallet",
  )?.balance
  const usdWalletBalance = data?.myUpdates?.me?.defaultAccount?.wallets?.find(
    (wallet) => wallet?.__typename === "USDWallet",
  )?.balance

  return {
    convertCurrencyAmount,
    formatCurrencyAmount,
    usdPerSat: cachedPrice === 0 ? null : (cachedPrice / 100).toFixed(8),
    currentBtcWalletBalance: btcWalletBalance,
    currentUsdWalletBalance: usdWalletBalance,
    intraLedgerUpdate: intraLedgerUpdate.current,
    lnUpdate: lnUpdate.current,
    onChainUpdate: onChainUpdate.current,
    mySubscriptionLoading: loading,
  }
}
