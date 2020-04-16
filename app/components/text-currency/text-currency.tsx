import currency from "currency.js"
import * as React from "react"
import { Text } from "react-native"
import { palette } from "../../theme/palette"
import { CurrencyType } from "../../utils/enum"

export const TextCurrency = ({ amount, currencyUsed, fontSize }) => {
  if (currencyUsed === CurrencyType.USD) {
    return (
      <Text style={{ fontSize, color: palette.darkGrey }}>
        {currency(amount, { formatWithSymbol: true }).format()}
      </Text>
    )
  } /* if (currency === CurrencyType.BTC) */ else {
    return (
      <>
        <Text style={{ fontSize, color: palette.darkGrey }}>
          {currency(amount, { precision: 0, separator: "," }).format()} sats
        </Text>
      </>
    )
  }
}
