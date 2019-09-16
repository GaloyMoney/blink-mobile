import * as React from "react"
import { View, ViewStyle, StyleSheet } from "react-native"
import { Text } from "../text"
import { color } from "../../theme"

import currency from "currency.js" 
import { CurrencyType } from "../../models/data-store/CurrencyType"

export interface BalanceHeaderProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: ViewStyle

  amount: number
  currency: CurrencyType

  eq_dollar?: number
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    alignItems: "center",
    marginTop: 48, 
    marginBottom: 24,
  },

  amount: {
    flexDirection: 'column',
    alignItems: 'center',
    height: 42, // FIXME should be dynamic?
  },

  balanceText: {
    fontSize: 16,
    color: color.primary,
    marginVertical: 20,
    fontWeight: 'bold',
  }, 
})

/**
 * Stateless functional component for your needs
 *
 * Component description here for TypeScript tips.
 */
export function BalanceHeader(props: BalanceHeaderProps) {
  const { style, ...rest } = props

  const size = 32

  switch (props.currency) {
    case CurrencyType.USD:
      var text_comp = <Text style={{fontSize: size, color: color.text,}}>
          {currency(props.amount, { formatWithSymbol: true } ).format()}
      </Text>
      break;
    case CurrencyType.BTC:
      var text_comp = 
        <View style={styles.amount}>
          <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
            <Text style={{fontSize: size, color: color.text,}}>
              {currency(props.amount, { precision: 0, separator: ',' } ).format()}
            </Text>
            <Text style={{fontSize: size / 2, color: color.text,}}> sats</Text>
          </View>
            <Text style={{fontSize: size / 2, color: color.text,}}>
              {currency(props.eq_dollar, { formatWithSymbol: true } ).format()}
            </Text>
        </View>
      break;
  }

  return (
    <View style={styles.header} {...rest}>
        {text_comp}
      <Text style={styles.balanceText}>Current Balance</Text>
    </View>
  )
}
