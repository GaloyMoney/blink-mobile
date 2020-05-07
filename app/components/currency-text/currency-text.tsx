import currency_fmt from "currency.js"
import * as React from "react"
import { StyleSheet, Text, View, ViewStyle } from "react-native"
import { color } from "../../theme"
import { CurrencyType } from "../../utils/enum"


export interface CurrencyTextProps {
  amount: number
  currency: CurrencyType
  textColor?: string
}

const styles = StyleSheet.create({
  smallText: {
    color: color.text,
    fontSize: 12,
  },

  text: {
    color: color.text,
    fontSize: 18,
  },
})

export function CurrencyText({ amount, currency, textColor }: CurrencyTextProps) {
  const color = textColor ? {color: textColor} : undefined

  switch (currency) {
    case CurrencyType.USD:
      return <Text>{currency_fmt(amount, { formatWithSymbol: true }).format()}</Text>
    case CurrencyType.BTC:
      return (
        <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
          <Text style={[styles.text, color]}>
            {currency_fmt(amount, { precision: 0, separator: "," }).format()}
          </Text>
          <Text style={[styles.smallText, color]}> sats</Text>
        </View>
      )
    default: return <Text>Missing currency variable</Text>
  }
}
