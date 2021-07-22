export const currencyFormatting = {
  USD: (usd: number): string =>
    usd < 0.01 ? (usd == 0 ? usd.toFixed(2) : usd.toFixed(4)) : usd.toFixed(2),
  sats: (sats: number): string => sats.toFixed(0),
  BTC: (btc: number): number => btc,
}

interface CurrencyConverter {
  primary: string
  conversion: (value: number) => string
  reverse: (value: number) => number
  secondary: string
  secondaryConversion: (value: number) => string | number
}

interface CurrencyConverters {
  USD: CurrencyConverter
  sats: CurrencyConverter
  BTC: CurrencyConverter
}

export const CurrencyConversion = (btcPrice: number): CurrencyConverters => ({
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
  currency: string,
): string => {
  const cc = CurrencyConversion(price).sats
  if (currency === "sats") {
    return `${cc.conversion(sats)} sats`
  }
  if (currency === "USD") {
    return `$${cc.secondaryConversion(sats)}`
  }
  throw Error("wrong currency")
}
