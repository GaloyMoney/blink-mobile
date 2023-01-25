import * as React from "react"
import { Text, TextStyle, View } from "react-native"
import { palette } from "@app/theme"
import SatsIcon from "../../assets/icons/sat.svg"
import EStyleSheet from "react-native-extended-stylesheet"
import { satAmountDisplay, usdAmountDisplay } from "@app/utils/currencyConversion"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"

type Props = {
  amount: number
  currency: CurrencyType
  style: TextStyle
  satsIconSize?: number
  iconColor?: string
}

const ComponentStyle = EStyleSheet.create({
  view: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
})

export const TextCurrencyForAmount: React.FC<Props> = ({
  amount,
  currency,
  style,
  satsIconSize,
  iconColor,
}) => {
  const { formatToDisplayCurrency } = useDisplayCurrency()
  if (currency === "display") {
    return <Text style={style}>{formatToDisplayCurrency(amount)}</Text>
  }
  if (currency === "USD") {
    const amountDisplay = Number.isNaN(amount) ? "..." : usdAmountDisplay(amount)
    return <Text style={style}>{amountDisplay}</Text>
  }
  if (currency === "BTC") {
    return Number.isNaN(amount) ? (
      <Text style={style}>...</Text>
    ) : (
      <View style={ComponentStyle.view}>
        <SatsIcon
          // @ts-expect-error: fill
          style={{
            fill: iconColor || palette.black,
            width: satsIconSize,
            height: satsIconSize,
          }}
        />
        <Text style={style}>{satAmountDisplay(amount)}</Text>
      </View>
    )
  }
  return null
}
