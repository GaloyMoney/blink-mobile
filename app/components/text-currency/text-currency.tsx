import * as React from "react"
import { Text, TextStyle, View } from "react-native"
import type { ComponentType } from "../../types/jsx"
import { palette } from "@app/theme"
import SatsIcon from "../../assets/icons/sat.svg"
import EStyleSheet from "react-native-extended-stylesheet"
import { satAmountDisplay } from "@app/utils/currencyConversion"
import { DisplayCurrency } from "../display-currency/display-currency"
type Props = {
  amount: number
  currency: CurrencyType
  style: TextStyle
  satsIconSize?: number
  iconColor: string
}

const ComponentStyle = EStyleSheet.create({
  view: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
})

export const TextCurrencyForAmount: ComponentType = ({
  amount,
  currency,
  style,
  satsIconSize,
  iconColor = palette.black,
}: Props) => {
  if (currency === "USD") {
    return (
      <Text style={style}>
        <DisplayCurrency amount={Number(amount)} />
      </Text>
    )
  }
  if (currency === "BTC") {
    return Number.isNaN(amount) ? (
      <Text style={style}>...</Text>
    ) : (
      <View style={ComponentStyle.view}>
        <SatsIcon
          // @ts-expect-error: fill
          style={{ fill: iconColor, width: satsIconSize, height: satsIconSize }}
        />
        <Text style={style}>{satAmountDisplay(amount)}</Text>
      </View>
    )
  }
  return null
}
