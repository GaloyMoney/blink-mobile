import * as React from "react"
import { View, ViewStyle, StyleSheet } from "react-native"
import { Text } from "../text"

import currency_fmt from "currency.js"
import { color } from "../../theme"
import { CurrencyType } from "../../utils/enum"

export interface CurrencyTextProps {
  amount: number
  currency: CurrencyType
  /**
   * An optional style override useful for padding & margin.
   */
  style?: ViewStyle
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

export function CurrencyText(props: CurrencyTextProps) {
  // grab the props
  const { amount, currency } = props

  switch (currency) {
    case CurrencyType.USD:
      return <Text>{currency_fmt(amount, { formatWithSymbol: true }).format()}</Text>
    case CurrencyType.BTC:
      return (
        <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
          <Text style={styles.text}>
            {currency_fmt(amount, { precision: 0, separator: "," }).format()}
          </Text>
          <Text style={styles.smallText}> sats</Text>
        </View>
      )
  }
}
