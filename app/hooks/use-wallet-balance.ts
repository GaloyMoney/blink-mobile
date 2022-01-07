import useToken from "../utils/use-token"
import { useMySubscription } from "./user-hooks"
import useMainQuery from "./use-main-query"
import { useTransactions } from "./use-transactions"

export const useWalletBalance = (): {
  walletId?: string
  satBalance: number
  usdBalance: number | string
  loading: boolean
} => {
  const { convertCurrencyAmount, currentBalance, mySubscriptionLoading } =
    useMySubscription()
  const { btcWalletBalance, btcWalletId } = useMainQuery()
  const { refetch: refetchTransactions } = useTransactions()

  const { hasToken } = useToken()

  if (!hasToken) {
    return {
      satBalance: 0,
      usdBalance: 0,
      loading: false,
    }
  }

  if (currentBalance && currentBalance !== btcWalletBalance) {
    // balance has updated so new transactions have been made
    refetchTransactions({
      first: 10,
    })
  }

  return {
    walletId: btcWalletId,
    satBalance: btcWalletBalance,
    usdBalance:
      btcWalletBalance > 0
        ? convertCurrencyAmount({ amount: btcWalletBalance, from: "BTC", to: "USD" })
        : 0,
    loading: mySubscriptionLoading,
  }
}
