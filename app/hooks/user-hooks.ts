import { gql, useApolloClient, useReactiveVar, useSubscription } from "@apollo/client"
import { PaymentAmount, WalletCurrency } from "@app/types/amounts"
import * as React from "react"

import {
  PRICE_CACHE,
  prefCurrencyVar as primaryCurrencyVar,
} from "../graphql/client-only-query"
import useMainQuery from "./use-main-query"

type UseMyUpdates = {
  convertCurrencyAmount: (arg0: {
    amount: number
    from: CurrencyType
    to: CurrencyType
  }) => number
  convertPaymentAmount: (
    paymentAmount: PaymentAmount<WalletCurrency>,
    toCurrency: WalletCurrency,
  ) => PaymentAmount<WalletCurrency>
  convertPaymentAmountToPrimaryCurrency: (
    paymentAmount: PaymentAmount<WalletCurrency>,
  ) => PaymentAmount<WalletCurrency>
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
  const { initialBtcPrice } = useMainQuery()

  const [cachedPrice, setCachedPrice] = React.useState(() => {
    if (initialBtcPrice) {
      return initialBtcPrice?.formattedAmount
    }
    const lastPriceData = client.readQuery({ query: PRICE_CACHE })
    if (!lastPriceData && !initialBtcPrice) {
      throw new Error("No price data in cache or inital price")
    }
    return lastPriceData?.price
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

export const useMySubscription = (): UseMyUpdates => {
  const { data, loading } = useSubscription(MY_UPDATES_SUBSCRIPTION)

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

  const convertPaymentAmount = React.useCallback(
    (paymentAmount, toCurrency) => {
      if (cachedPrice === 0) {
        return NaN
      }

      if (paymentAmount.currency === toCurrency) {
        return paymentAmount
      }

      if (
        paymentAmount.currency === WalletCurrency.BTC &&
        toCurrency === WalletCurrency.USD
      ) {
        return {
          amount: Math.round(paymentAmount * cachedPrice),
          currency: WalletCurrency.USD,
        }
      }
      if (
        paymentAmount.currency === WalletCurrency.USD &&
        toCurrency === WalletCurrency.BTC
      ) {
        return {
          amount: Math.round(paymentAmount.amount / cachedPrice),
          currency: WalletCurrency.BTC,
        }
      }
    },
    [cachedPrice],
  )

  const primaryCurrency = useReactiveVar<CurrencyType>(primaryCurrencyVar)

  const convertPaymentAmountToPrimaryCurrency = (
    paymentAmount: PaymentAmount<WalletCurrency>,
  ) => convertPaymentAmount(paymentAmount, primaryCurrency)

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
    convertPaymentAmount,
    convertPaymentAmountToPrimaryCurrency,
    usdPerSat: cachedPrice === 0 ? null : (cachedPrice / 100).toFixed(8),
    currentBtcWalletBalance: btcWalletBalance,
    currentUsdWalletBalance: usdWalletBalance,
    intraLedgerUpdate: intraLedgerUpdate.current,
    lnUpdate: lnUpdate.current,
    onChainUpdate: onChainUpdate.current,
    mySubscriptionLoading: loading,
  }
}
