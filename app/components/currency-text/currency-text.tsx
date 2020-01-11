import * as React from "react"
import { View, ViewStyle, StyleSheet } from "react-native"
import { Text } from "../text"

import currency from "currency.js"
import { color } from "../../theme"
import { CurrencyType } from "../../utils/enum"

export interface CurrencyTextProps {
  amount: number
  currency: CurrencyType

  eq_dollar?: number

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

/**
 * Stateless functional component for your needs
 *
 * Component description here for TypeScript tips.
 */
export function CurrencyText(props: CurrencyTextProps) {
  // grab the props
  const { style, amount, ...rest } = props
  const comp: React.Component

  switch (props.currency) {
    case CurrencyType.USD:
      return <Text>{currency(amount, { formatWithSymbol: true }).format()}</Text>
    case CurrencyType.BTC:
      return (
        <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
          <Text style={styles.text}>
            {currency(amount, { precision: 0, separator: "," }).format()}
          </Text>
          <Text style={styles.smallText}> sats</Text>
        </View>
      )
  }

  return <Text>issue: {props.currency}</Text>
}
