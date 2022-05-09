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
  iconColor: string
}

export const TextCurrency: ComponentType = ({
  amount,
  currency,
  style,
  satsIconSize,
  iconColor = palette.black
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
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingLeft: 8,
        }}
      >
        <SatsIcon
          style={{
            fill: iconColor,
            width: satsIconSize,
            height: satsIconSize,
          }}
        />
        <Text
          style={[{
            ...style,
          }]}
        >
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
