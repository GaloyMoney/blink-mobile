import * as React from "react"
import currency from "currency.js"
import { Text } from "react-native"
import { CurrencyType } from "../../utils/enum"
import { color } from "../../theme"

export const TextCurrency = ({ amount, currencyUsed, fontSize }) => {
  if (currencyUsed === CurrencyType.USD) {
    return (
      <Text style={{ fontSize, color: color.text }}>
        {currency(amount, { formatWithSymbol: true }).format()}
      </Text>
    )
  } /* if (currency === CurrencyType.BTC) */ else {
    return (
      <>
        <Text style={{ fontSize, color: color.text }}>
          {currency(amount, { precision: 0, separator: "," }).format()} sats
        </Text>
      </>
    )
  }
}
