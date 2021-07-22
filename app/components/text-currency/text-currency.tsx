import * as currency_fmt from "currency.js"
import * as React from "react"
import { Text, TextStyle, View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import type { ComponentType } from "../../types/jsx"
import { CurrencyType } from "../../utils/enum"

const styles = EStyleSheet.create({
  container: {
    alignItems: "flex-end",
    flexDirection: "row",
  },
})

type Props = {
  amount: number
  currency: string
  style: TextStyle
}

export const TextCurrency: ComponentType = ({ amount, currency, style }: Props) => {
  if (currency === CurrencyType.USD) {
    return (
      <Text style={style}>
        {currency_fmt
          .default(amount, { precision: amount < 0.01 && amount !== 0 ? 4 : 2 })
          .format()}
      </Text>
    )
  }
  if (currency === CurrencyType.BTC) {
    return (
      <View style={styles.container}>
        <Text style={style}>
          {currency_fmt
            .default(amount, { precision: 0, separator: ",", symbol: "" })
            .format()}{" "}
        </Text>
        {/* <Text style={[style, {fontSize: 24}]}>BTC</Text> */}
        <Text style={style}>BTC</Text>
      </View>
    )
  } // if (currency === "sats") {
  return (
    <Text style={style}>
      {currency_fmt
        .default(amount, {
          formatWithSymbol: false,
          precision: 0,
          separator: ",",
          symbol: "",
        })
        .format()}{" "}
      sats
    </Text>
  )
}
