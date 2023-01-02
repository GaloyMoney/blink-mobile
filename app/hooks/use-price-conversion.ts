import { usePriceContext } from "@app/store/price-context"
import {
  DisplayAmount,
  DisplayCurrency,
  PaymentAmount,
  WalletCurrency,
} from "@app/types/amounts"
import * as React from "react"

export const usePriceConversion = () => {
  const priceData = usePriceContext()
  const convertCurrencyAmount = React.useCallback(
    ({
      amount,
      from,
      to,
    }: {
      amount: number
      from: "USD" | "BTC"
      to: "USD" | "BTC"
    }) => {
      if (!priceData.initialized) {
        return NaN
      }
      if (from === "BTC" && to === "USD") {
        return (amount * priceData.price) / 100
      }
      if (from === "USD" && to === "BTC") {
        return (100 * amount) / priceData.price
      }
      // TODO this is where we will need logic to support exchange between multiple display currencies
      return amount
    },
    [priceData],
  )

  const convertPaymentAmount = React.useCallback(
    <T extends WalletCurrency>(
      paymentAmount: PaymentAmount<WalletCurrency>,
      toCurrency: T,
    ): PaymentAmount<T> => {
      if (!priceData.initialized) {
        return {
          amount: NaN,
          currency: toCurrency,
        }
      }

      if (
        paymentAmount.currency === WalletCurrency.BTC &&
        toCurrency === WalletCurrency.USD
      ) {
        return {
          amount: Math.round(paymentAmount.amount * priceData.price),
          currency: toCurrency,
        }
      }

      if (
        paymentAmount.currency === WalletCurrency.USD &&
        toCurrency === WalletCurrency.BTC
      ) {
        return {
          amount: Math.round(paymentAmount.amount / priceData.price),
          currency: toCurrency,
        }
      }

      return {
        amount: Math.round(paymentAmount.amount),
        currency: toCurrency,
      }
    },
    [priceData],
  )

  const convertDisplayAmount = React.useCallback(
    <T extends DisplayCurrency>(
      displayAmount: DisplayAmount<DisplayCurrency>,
      toCurrency: T,
    ): DisplayAmount<T> => {
      if (!priceData.initialized) {
        return {
          amount: NaN,
          currency: toCurrency,
        }
      }

      if (
        displayAmount.currency === DisplayCurrency.BTC &&
        toCurrency === DisplayCurrency.USD
      ) {
        return {
          amount: Math.round(displayAmount.amount * priceData.price),
          currency: toCurrency,
        }
      }

      if (
        displayAmount.currency === DisplayCurrency.USD &&
        toCurrency === DisplayCurrency.BTC
      ) {
        return {
          amount: Math.round(displayAmount.amount / priceData.price),
          currency: toCurrency,
        }
      }

      return {
        amount: Math.round(displayAmount.amount),
        currency: toCurrency,
      }
    },
    [priceData],
  )

  return {
    convertCurrencyAmount,
    convertPaymentAmount,
    convertDisplayAmount,
    usdPerBtc: {
      currency: WalletCurrency.USD,
      amount: priceData.initialized ? priceData.price * 100000000 : NaN,
    } as PaymentAmount<WalletCurrency.USD>,
    usdPerSat: priceData.initialized ? (priceData.price / 100).toFixed(8) : null,
  }
}
