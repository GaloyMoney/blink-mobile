import {
  RealtimePriceDocument,
  useRealtimePriceQuery,
  WalletCurrency,
} from "@app/graphql/generated"
import {
  WalletOrDisplayCurrency,
  DisplayCurrency,
  moneyAmountIsCurrencyType,
  MoneyAmount,
  PaymentAmount,
  UsdPaymentAmount,
} from "@app/types/amounts"
import * as React from "react"
import { useMemo } from "react"

export const usePriceConversion = () => {
  const { data } = useRealtimePriceQuery({
    query: RealtimePriceDocument,
  })

  let displayCurrencyPerSat = NaN
  let displayCurrencyPerCent = NaN

  if (data) {
    displayCurrencyPerSat =
      data.realtimePrice.btcSatPrice.base / 10 ** data.realtimePrice.btcSatPrice.offset
    displayCurrencyPerCent =
      data.realtimePrice.usdCentPrice.base / 10 ** data.realtimePrice.usdCentPrice.offset
  }

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
      if (from === "BTC" && to === "USD") {
        return (amount * displayCurrencyPerSat) / 100
      }
      if (from === "USD" && to === "BTC") {
        return (100 * amount) / displayCurrencyPerSat
      }
      return amount
    },
    [displayCurrencyPerSat],
  )

  const convertPaymentAmount = React.useCallback(
    <T extends WalletCurrency>(
      paymentAmount: PaymentAmount<WalletCurrency>,
      toCurrency: T,
    ): PaymentAmount<T> => {
      if (!displayCurrencyPerSat) {
        return {
          amount: NaN,
          currency: toCurrency,
        }
      }

      if (
        paymentAmount.currency === WalletCurrency.Btc &&
        toCurrency === WalletCurrency.Usd
      ) {
        return {
          amount: Math.round(paymentAmount.amount * displayCurrencyPerSat),
          currency: toCurrency,
        }
      }

      if (
        paymentAmount.currency === WalletCurrency.Usd &&
        toCurrency === WalletCurrency.Btc
      ) {
        return {
          amount: Math.round(paymentAmount.amount / displayCurrencyPerSat),
          currency: toCurrency,
        }
      }

      return {
        amount: Math.round(paymentAmount.amount),
        currency: toCurrency,
      }
    },
    [displayCurrencyPerSat],
  )

  const priceOfCurrencyInCurrency = useMemo(() => {
    if (!displayCurrencyPerSat || !displayCurrencyPerCent) {
      return undefined
    }

    // has units of denomiatedInCurrency/currency
    return (
      currency: WalletOrDisplayCurrency,
      inCurrency: WalletOrDisplayCurrency,
    ): number => {
      const priceOfCurrencyInCurrency = {
        [WalletCurrency.Btc]: {
          [DisplayCurrency]: displayCurrencyPerSat,
          [WalletCurrency.Usd]: displayCurrencyPerSat * (1 / displayCurrencyPerCent),
          [WalletCurrency.Btc]: 1,
        },
        [WalletCurrency.Usd]: {
          [DisplayCurrency]: displayCurrencyPerCent,
          [WalletCurrency.Btc]: displayCurrencyPerCent * (1 / displayCurrencyPerSat),
          [WalletCurrency.Usd]: 1,
        },
        [DisplayCurrency]: {
          [WalletCurrency.Btc]: 1 / displayCurrencyPerSat,
          [WalletCurrency.Usd]: 1 / displayCurrencyPerCent,
          [DisplayCurrency]: 1,
        },
      }
      return priceOfCurrencyInCurrency[currency][inCurrency]
    }
  }, [displayCurrencyPerSat, displayCurrencyPerCent])

  const convertMoneyAmount = useMemo(() => {
    if (!priceOfCurrencyInCurrency) {
      return undefined
    }

    return <T extends WalletOrDisplayCurrency>(
      moneyAmount: MoneyAmount<WalletOrDisplayCurrency>,
      toCurrency: T,
    ): MoneyAmount<T> => {
      // If the money amount is already the correct currency, return it
      if (moneyAmountIsCurrencyType(moneyAmount, toCurrency)) {
        return moneyAmount
      }

      return {
        amount: Math.round(
          moneyAmount.amount *
            priceOfCurrencyInCurrency(moneyAmount.currency, toCurrency),
        ),
        currency: toCurrency,
      }
    }
  }, [priceOfCurrencyInCurrency])

  return {
    convertCurrencyAmount,
    convertPaymentAmount,
    convertMoneyAmount,
    usdPerBtc: {
      currency: WalletCurrency.Usd,
      amount: priceOfCurrencyInCurrency
        ? priceOfCurrencyInCurrency(WalletCurrency.Btc, WalletCurrency.Usd) * 100000000
        : NaN,
    } as UsdPaymentAmount,
    usdPerSat: priceOfCurrencyInCurrency
      ? (priceOfCurrencyInCurrency(WalletCurrency.Btc, WalletCurrency.Usd) / 100).toFixed(
          8,
        )
      : null,
  }
}
