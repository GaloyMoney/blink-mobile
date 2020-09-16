
export const currencyFormatting = {
  USD: usd => usd < 0.01 ? (usd).toFixed(4) : (usd).toFixed(2),
  sats: sats => sats.toFixed(0),
  BTC: btc => btc,
} 

export const CurrencyConversion = (price) => ({
  USD: {
    primary: "USD",
    // TODO refactor: other place could use those conversions
    conversion: sats => currencyFormatting["USD"](sats * price),
    reverse: (usd) => usd / price,
    secondary: "sats",
    secondaryConversion: (sats) => sats,
  },
  sats: {
    primary: "sats",
    conversion: (sats) => currencyFormatting["sats"](sats),
    reverse: (sats) => sats,
    secondary: "USD",
    secondaryConversion: (sats) => sats * price,
  },
  BTC: {
    primary: "BTC",
    conversion: (sats) => (sats / 10 ** 8).toFixed(8), // BigNum?
    reverse: (btc) => btc * 10 ** 8,
    secondary: "USD",
    secondaryConversion: (sats) => sats * price,
  },
})