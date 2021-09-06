export const currencyFormatting = {
  USD: (usd: number): string =>
    usd < 0.01 ? (usd == 0 ? usd.toFixed(2) : usd.toFixed(4)) : usd.toFixed(2),
  sats: (sats: number): string => sats.toFixed(0),
  BTC: (btc: number): number => btc,
}

interface OldCurrencyConverter {
  primary: string
  conversion: (value: number) => string
  reverse: (value: number) => number
  secondary: string
  secondaryConversion: (value: number) => string | number
}

interface OldCurrencyConverters {
  USD: OldCurrencyConverter
  sats: OldCurrencyConverter
  BTC: OldCurrencyConverter
}

export const OldCurrencyConversion = (btcPrice: number): OldCurrencyConverters => ({
  USD: {
    primary: "USD",
    // TODO refactor: other place could use those conversions
    conversion: (sats) => currencyFormatting.USD(sats * btcPrice),
    reverse: (usd) => usd / btcPrice,
    secondary: "sats",
    secondaryConversion: (sats) => currencyFormatting.sats(sats),
  },
  sats: {
    primary: "sats",
    conversion: (sats) => currencyFormatting.sats(sats),
    reverse: (sats) => sats,
    secondary: "USD",
    secondaryConversion: (sats) => currencyFormatting.USD(sats * btcPrice),
  },
  BTC: {
    primary: "BTC",
    conversion: (sats) => (sats / 10 ** 8).toFixed(8), // BigNum?
    reverse: (btc) => btc * 10 ** 8,
    secondary: "USD",
    secondaryConversion: (sats) => sats * btcPrice,
  },
})

// TODO: refactor. this is probably elsewhere as well.
export const textCurrencyFormatting = (
  sats: number,
  price: number,
  currency: CurrencyType,
): string => {
  const cc = OldCurrencyConversion(price).sats
  if (currency === "BTC") {
    if (sats === 1) {
      return "1 sat"
    }
    return `${cc.conversion(sats)} sats`
  }
  if (currency === "USD") {
    return `$${cc.secondaryConversion(sats)}`
  }
  throw Error("wrong currency")
}

const isCurrencyWithDecimals = (currency) => {
  return currency === "USD"
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
  } else {
    return value
  }
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

export const currencyToText = (
  value: string,
  currency: CurrencyType,
  locale = "en-US",
): string =>
  isCurrencyWithDecimals(currency)
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

const getDigitsFromValue = (value = "") => value.replace(/(-(?!\d))|[^0-9|-]/g, "") || ""

const removeLeadingZeros = (number) => number.replace(/^0+([0-9]+)/, "$1")

const addDecimalToNumber = (number: string, separator: string) => {
  const fractionsStartingPosition = number.length - 2
  const integerDigits = removeLeadingZeros(number.substring(0, fractionsStartingPosition))
  const fractionDigits = number.substring(fractionsStartingPosition)
  return integerDigits + separator + fractionDigits
}
