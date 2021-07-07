export const currencyFormatting = {
  USD: (usd) =>
    usd < 0.01 ? (usd == 0 ? usd.toFixed(2) : usd.toFixed(4)) : usd.toFixed(2),
  sats: (sats) => sats.toFixed(0),
  BTC: (btc) => btc,
}

export const CurrencyConversion = (btcPrice) => ({
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
export const textCurrencyFormatting = (sats, price, currency) => {
  const cc = CurrencyConversion(price).sats
  if (currency === "sats") {
    return `${cc.conversion(sats)} sats`
  }
  if (currency === "USD") {
    return `$${cc.secondaryConversion(sats)}`
  }
  throw Error("wrong currency")
}
