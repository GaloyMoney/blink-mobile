import { BtcPaymentAmount, PaymentAmount, UsdPaymentAmount } from "@app/types/amounts"
import React from "react"
import { usePriceConversion } from "./use-price-conversion"
import { WalletCurrency } from "@app/graphql/generated"

export const useUsdBtcAmount = (initialAmount?: PaymentAmount<WalletCurrency>) => {
  const [paymentAmount, setPaymentAmount] = React.useState<PaymentAmount<WalletCurrency>>(
    initialAmount || { amount: 0, currency: WalletCurrency.Usd },
  )
  const { convertPaymentAmount } = usePriceConversion()

  const btcAmount = React.useMemo(() => {
    return paymentAmount.currency === WalletCurrency.Btc
      ? (paymentAmount as BtcPaymentAmount)
      : convertPaymentAmount(paymentAmount, WalletCurrency.Btc)
  }, [paymentAmount, convertPaymentAmount])

  const usdAmount = React.useMemo(() => {
    return paymentAmount.currency === WalletCurrency.Usd
      ? (paymentAmount as UsdPaymentAmount)
      : convertPaymentAmount(paymentAmount, WalletCurrency.Usd)
  }, [paymentAmount, convertPaymentAmount])

  const setAmountsWithBtc = React.useCallback(
    (sats: number) => {
      setPaymentAmount({ amount: Math.abs(sats), currency: WalletCurrency.Btc })
    },
    [setPaymentAmount],
  )

  const setAmountsWithUsd = React.useCallback(
    (cents: number) => {
      setPaymentAmount({ amount: Math.abs(cents), currency: WalletCurrency.Usd })
    },
    [setPaymentAmount],
  )

  const toggleAmountCurrency = React.useCallback(() => {
    setPaymentAmount(
      paymentAmount.currency === WalletCurrency.Btc ? usdAmount : btcAmount,
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
