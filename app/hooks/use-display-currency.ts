import { LocalizationContext } from "@app/store/localization-context"
import { DisplayCurrency } from "@app/types/amounts"
import { useCallback, useContext } from "react"

export const useDisplayCurrency = () => {
  const { displayCurrency, setDisplayCurrency, locale } = useContext(LocalizationContext)

  const formatToCurrency = useCallback(
    (amount: number, currency: DisplayCurrency) => {
      if (currency === "BTC") {
        if (amount === 1) {
          return "1 sat"
        }
        return `${Intl.NumberFormat(locale, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(amount)} sats`
      }
      if (amount < 100) {
        // amount contains only fractional units
        return Intl.NumberFormat(locale, {
          style: "currency",
          currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(amount)
      } else if (amount % 100 === 0) {
        // amount ends with 00 (does not contain fractional units)
        return Intl.NumberFormat(locale, {
          style: "currency",
          currency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(amount / 100)
      }
      return Intl.NumberFormat(locale, {
        style: "currency",
        currency,
      }).format(amount / 100)
    },
    [locale],
  )

  const formatToDisplayCurrency = useCallback(
    (amount: number) => {
      if (displayCurrency === "BTC") {
        if (amount === 1) {
          return "1 sat"
        }
        return `${amount} sats`
      }
      if (amount < 100) {
        // amount contains only fractional units
        return Intl.NumberFormat(locale, {
          style: "currency",
          currency: displayCurrency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(amount)
      } else if (amount % 100 === 0) {
        // amount ends with 00 (does not contain fractional units)
        return Intl.NumberFormat(locale, {
          style: "currency",
          currency: displayCurrency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(amount)
      }
      return Intl.NumberFormat(locale, {
        style: "currency",
        currency: displayCurrency,
      }).format(amount)
    },
    [displayCurrency, locale],
  )

  return {
    displayCurrency,
    setDisplayCurrency,
    formatToCurrency,
    formatToDisplayCurrency,
  }
}
