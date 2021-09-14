import toInteger from "lodash.tointeger"
import { useBTCPrice } from "./use-btc-price"

type CurrencyConverter = {
  BTC: (value: number) => number
  USD: (value: number) => number
}

type CurrencyConverterTypes = {
  BTC: CurrencyConverter
  USD: CurrencyConverter
}

export const useCurrencyConverter = (): CurrencyConverterTypes => {
  const btcPrice = useBTCPrice()

  return {
    BTC: {
      BTC: (sats) => toInteger(sats),
      USD: (sats) => sats * btcPrice,
    },
    USD: {
      BTC: (usd) => toInteger(usd / btcPrice),
      USD: (usd) => usd,
    },
  }
}
