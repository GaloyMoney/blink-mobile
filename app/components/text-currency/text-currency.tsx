import * as currency_fmt from "currency.js"
import * as React from "react"
import { Text, TextStyle, View } from "react-native"
import type { ComponentType } from "../../types/jsx"
import { palette } from "@app/theme"
import SatsIcon from "../../assets/icons/sat.svg"
type Props = {
  amount: number
  currency: CurrencyType
  style: TextStyle
  satsIconSize?: number
}

export const TextCurrency: ComponentType = ({
  amount,
  currency,
  style,
  satsIconSize,
}: Props) => {
  if (currency === "USD") {
    const amountDisplay = Number.isNaN(amount)
      ? "..."
      : currency_fmt
          .default(amount, { precision: amount < 0.01 && amount !== 0 ? 4 : 2 })
          .format()
    return <Text style={style}>{amountDisplay}</Text>
  }
  if (currency === "BTC") {
    return Number.isNaN(amount) ? (
      <Text style={style}>...</Text>
    ) : (
      <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
        <SatsIcon
          style={{
            fill: palette.black,
            height: satsIconSize,
            flex: 1,
          }}
        />
        <Text style={style}>
          {currency_fmt
            .default(amount, {
              precision: 0,
              separator: ",",
              symbol: "",
            })
            .format()}
        </Text>
      </View>
    )
  }
  return null
}
