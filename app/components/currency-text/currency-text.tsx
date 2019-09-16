import * as React from "react"
import { View, ViewStyle, StyleSheet } from "react-native"
import { Text } from "../text"
import { CurrencyType } from "../../models/data-store/CurrencyType"

import currency from 'currency.js'
import { color } from "../../theme"

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
  text: {
    fontSize: 18,
    color: color.text
  },

  smallText: {
    fontSize: 12,
    color: color.text
  }
})

/**
 * Stateless functional component for your needs
 *
 * Component description here for TypeScript tips.
 */
export function CurrencyText(props: CurrencyTextProps) {
  // grab the props
  const { style, amount, ...rest } = props
  var comp: React.Component = undefined

  switch(props.currency) {
    case CurrencyType.USD:
      return (<Text>{currency(amount, { formatWithSymbol: true } ).format()}</Text>)
    case CurrencyType.BTC:
      return (
      <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
        <Text style={styles.text}>
            {currency(amount, { precision: 0, separator: ',' } ).format()}
        </Text>
        <Text style={styles.smallText}> sats</Text>
      </View>
    )
  }

  return <Text>issue: {props.currency}</Text>
}
