import * as currency_fmt from "currency.js"
import * as React from "react"
import { Text } from "react-native"
import { CurrencyType } from "../../utils/enum"

export const TextCurrency = ({ amount, currency, style }) => {
  if (currency === CurrencyType.USD) {
    return (
      <Text style={style}>
        {currency_fmt.default(amount, { formatWithSymbol: true }).format()}
      </Text>
    )
  } /* if (currency === CurrencyType.BTC) */ else {
    return (
      <>
        <Text style={style}>
          {currency_fmt.default(amount, { precision: 0, separator: "," }).format()} sats
        </Text>
      </>
    )
  }
}