import useToken from "../utils/use-token"
import { useMySubscription } from "./user-hooks"
import useMainQuery from "./use-main-query"

export const useWalletBalance = (): {
  btcWalletId?: string
  btcWalletBalance: number
  btcWalletValueInUsd: number
  usdWalletId?: string
  usdWalletBalance: number
  loading: boolean
} => {
  const {
    convertCurrencyAmount,
    currentBtcWalletBalance,
    currentUsdWalletBalance,
    mySubscriptionLoading,
  } = useMySubscription()
  const {
    btcWalletBalance,
    btcWalletId,
    usdWalletId,
    usdWalletBalance,
    refetch: refetchMainQuery,
  } = useMainQuery()

  const { hasToken } = useToken()

  if (!hasToken) {
    return {
      btcWalletBalance: 0,
      btcWalletValueInUsd: 0,
      usdWalletBalance: 0,
      loading: false,
    }
  }

  if (
    currentBtcWalletBalance &&
    currentUsdWalletBalance &&
    currentBtcWalletBalance !== btcWalletBalance &&
    currentUsdWalletBalance !== usdWalletBalance
  ) {
    refetchMainQuery()
  }

  return {
    btcWalletId,
    btcWalletBalance,
    btcWalletValueInUsd:
      btcWalletBalance > 0
        ? convertCurrencyAmount({ amount: btcWalletBalance, from: "BTC", to: "USD" })
        : 0,
    usdWalletId,
    usdWalletBalance,
    loading: mySubscriptionLoading,
  }
}
