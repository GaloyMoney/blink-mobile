import * as currencyFmt from "currency.js"
import crashlytics from "@react-native-firebase/crashlytics"

import { PaymentAmount, WalletCurrency } from "@app/types/amounts"

const isCurrencyWithDecimals = (currency) => {
  return currency === "USD"
}

export const paymentAmountToDollarsOrSats = (
  paymentAmount: PaymentAmount<WalletCurrency>,
) => {
  return paymentAmount.currency === WalletCurrency.USD
    ? paymentAmount.amount / 100
    : paymentAmount.amount
}

// Extracted from: https://github.com/ianmcnally/react-currency-masked-input/blob/3989ce3dfa69dbf78da00424811376c483aceb98/src/services/currency-conversion.js
export const textToCurrency = (
  value: string,
  currency: CurrencyType,
  separator = ".",
): string => {
  if (isCurrencyWithDecimals(currency)) {
    const digits = getDigitsFromValue(value)
    return addDecimalToNumber(digits, separator)
  }

  return value
}

export const currencyToTextWithUnits = (moneyAmount: MoneyAmount): string => {
  if (moneyAmount.currency === "BTC") {
    if (moneyAmount.value === 1) {
      return "1 sat"
    }
    return currencyToText(moneyAmount.value.toString(), moneyAmount.currency) + " sats"
  }

  if (moneyAmount.currency === "USD") {
    return "$" + currencyToText(moneyAmount.value.toString(), moneyAmount.currency)
  }
  throw Error("wrong currency")
}

export const paymentAmountToTextWithUnits = (
  paymentAmount: PaymentAmount<WalletCurrency>,
): string => {
  if (paymentAmount.currency === WalletCurrency.BTC) {
    if (paymentAmount.amount === 1) {
      return "1 sat"
    }
    return paymentAmountToText(paymentAmount) + " sats"
  }

  if (paymentAmount.currency === WalletCurrency.USD) {
    return "$" + paymentAmountToText(paymentAmount)
  }

  throw Error("wrong currency")
}

export const paymentAmountToText = (
  paymentAmount: PaymentAmount<WalletCurrency>,
  locale = "en-US",
): string => {
  if (paymentAmount.currency === WalletCurrency.USD) {
    try {
      const amount = paymentAmount.amount / 100
      return amount.toLocaleString(locale, {
        style: "decimal",
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      })
    } catch (error) {
      console.error(error)
      crashlytics().recordError(error)
      return "USD formating error"
    }
  }

  if (paymentAmount.currency === WalletCurrency.BTC) {
    try {
      return paymentAmount.amount.toLocaleString(locale, {
        style: "decimal",
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      })
    } catch (error) {
      console.error(error)
      crashlytics().recordError(error)
      return "Unable to parse amount to"
    }
  }

  throw Error("Currency not supported")
}

export const currencyToText = (
  value: string,
  currency: CurrencyType,
  locale = "en-US",
): string => {
  return isCurrencyWithDecimals(currency)
    ? Number(value).toLocaleString(locale, {
        style: "decimal",
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      })
    : Number(value).toLocaleString(locale, {
        style: "decimal",
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      })
}

const getDigitsFromValue = (value = "") => value.replace(/(-(?!\d))|[^0-9|-]/g, "") || ""

const removeLeadingZeros = (number) => number.replace(/^0+([0-9]+)/, "$1")

const addDecimalToNumber = (number: string, separator: string) => {
  const fractionsStartingPosition = number.length - 2
  const integerDigits = removeLeadingZeros(number.substring(0, fractionsStartingPosition))
  const fractionDigits = number.substring(fractionsStartingPosition)
  return integerDigits + separator + fractionDigits
}

export const usdAmountDisplay = (amount: number): string =>
  currencyFmt
    .default(amount, {
      precision: Math.abs(amount) < 0.01 && amount !== 0 ? 4 : 2,
      separator: ",",
      symbol: "$",
    })
    .format()

export const satAmountDisplay = (amount: number): string => {
  if (amount === 1) {
    return "1 sat"
  }
  return (
    currencyFmt
      .default(amount, {
        precision: 0,
        separator: ",",
        symbol: "",
      })
      .format() + " sats"
  )
}
