import * as currency_fmt from "currency.js"
import * as React from "react"
import { Text, TextStyle } from "react-native"
import type { ComponentType } from "../../types/jsx"

type Props = {
  amount: number
  currency: CurrencyType
  style: TextStyle
}

export const TextCurrency: ComponentType = ({ amount, currency, style }: Props) => {
  if (currency === "USD") {
    return (
      <Text style={style}>
        {currency_fmt
          .default(amount, { precision: amount < 0.01 && amount !== 0 ? 4 : 2 })
          .format()}
      </Text>
    )
  }
  if (currency === "BTC") {
    return (
      <Text style={style}>
        {currency_fmt
          .default(amount, {
            precision: 0,
            separator: ",",
            symbol: "",
          })
          .format()}{" "}
        sats
      </Text>
    )
  }
  return null
}
