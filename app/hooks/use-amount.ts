import { PaymentAmount, WalletCurrency } from "@app/types/amounts"
import React from "react"
import { useMySubscription } from "./user-hooks"

export const useUsdBtcAmount = (initialAmount?: PaymentAmount<WalletCurrency>) => {
  const [paymentAmount, setPaymentAmount] = React.useState<PaymentAmount<WalletCurrency>>(
    initialAmount || { amount: 0, currency: WalletCurrency.USD },
  )
  const { convertPaymentAmount } = useMySubscription()

  const btcAmount = React.useMemo(() => {
    return paymentAmount.currency === WalletCurrency.BTC
      ? (paymentAmount as PaymentAmount<WalletCurrency.BTC>)
      : convertPaymentAmount(paymentAmount, WalletCurrency.BTC)
  }, [paymentAmount, convertPaymentAmount])
  const usdAmount = React.useMemo(() => {
    return paymentAmount.currency === WalletCurrency.USD
      ? (paymentAmount as PaymentAmount<WalletCurrency.USD>)
      : convertPaymentAmount(paymentAmount, WalletCurrency.USD)
  }, [paymentAmount, convertPaymentAmount])

  const setAmountsWithBtc = React.useCallback(
    (sats: number) => {
      setPaymentAmount({ amount: sats, currency: WalletCurrency.BTC })
    },
    [setPaymentAmount],
  )

  const setAmountsWithUsd = React.useCallback(
    (cents: number) => {
      setPaymentAmount({ amount: cents, currency: WalletCurrency.USD })
    },
    [setPaymentAmount],
  )

  return {
    btcAmount,
    usdAmount,
    setAmountsWithBtc,
    setAmountsWithUsd,
    paymentAmount,
    setPaymentAmount,
  }
}
