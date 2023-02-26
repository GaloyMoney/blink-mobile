import * as currencyFmt from "currency.js"

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
