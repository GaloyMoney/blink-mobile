import { PaymentAmount, WalletCurrency } from "@app/types/amounts"
import React from "react"
import { usePriceConversion } from "./use-price-conversion"

export const useUsdBtcAmount = (initialAmount?: PaymentAmount) => {
  const [paymentAmount, setPaymentAmount] = React.useState<PaymentAmount>(
    initialAmount || { amount: 0, currency: WalletCurrency.USD },
  )
  const { convertPaymentAmount } = usePriceConversion()

  const btcAmount = React.useMemo(() => {
    return paymentAmount.currency === WalletCurrency.BTC
      ? (paymentAmount as PaymentAmount)
      : convertPaymentAmount(paymentAmount, WalletCurrency.BTC)
  }, [paymentAmount, convertPaymentAmount])
  const usdAmount = React.useMemo(() => {
    return paymentAmount.currency === WalletCurrency.USD
      ? (paymentAmount as PaymentAmount)
      : convertPaymentAmount(paymentAmount, WalletCurrency.USD)
  }, [paymentAmount, convertPaymentAmount])

  const setAmountsWithBtc = React.useCallback(
    (sats: number) => {
      setPaymentAmount({ amount: Math.abs(sats), currency: WalletCurrency.BTC })
    },
    [setPaymentAmount],
  )

  const setAmountsWithUsd = React.useCallback(
    (cents: number) => {
      setPaymentAmount({ amount: Math.abs(cents), currency: WalletCurrency.USD })
    },
    [setPaymentAmount],
  )

  const toggleAmountCurrency = React.useCallback(() => {
    setPaymentAmount(
      paymentAmount.currency === WalletCurrency.BTC ? usdAmount : btcAmount,
    )
  }, [paymentAmount, btcAmount, usdAmount])

  return {
    btcAmount,
    usdAmount,
    setAmountsWithBtc,
    setAmountsWithUsd,
    paymentAmount,
    setPaymentAmount,
    toggleAmountCurrency,
  }
}
