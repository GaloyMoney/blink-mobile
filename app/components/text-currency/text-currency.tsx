import * as currency_fmt from "currency.js"
import * as React from "react"
import { Text, View } from "react-native"
import { CurrencyType } from "../../utils/enum"

export const TextCurrency = ({ amount, currency, style }) => {
  if (currency === CurrencyType.USD) {
    return (
      <Text style={style}>
        {currency_fmt.default(amount, {
          precision: (amount < 0.01 && amount !== 0) ? 4 : 2 }).format()
        }
      </Text>
    )
  } if (currency === CurrencyType.BTC) {
    return (
      <View style={{ flexDirection: "row", alignItems: "flex-end"}}>
        <Text style={style}>{currency_fmt.default(amount, { precision: 0, separator: ",", symbol: '' }).format()} </Text>
        {/* <Text style={[style, {fontSize: 24}]}>BTC</Text> */}
        <Text style={style}>BTC</Text>
      </View>
    )
  } else { // if (currency === "sats") {
    return (
      <Text style={style}>
        {currency_fmt.default(amount, { formatWithSymbol: false, precision: 0, separator: ",", symbol: '' }).format()} sats
      </Text>
    )
  }
}