import * as React from "react"
import { Text, TextStyle, View } from "react-native"
import type { ComponentType } from "../../types/jsx"
import { palette } from "@app/theme"
import SatsIcon from "../../assets/icons/sat.svg"
import { useWalletBalance } from "@app/hooks"
import EStyleSheet from "react-native-extended-stylesheet"
import { satAmountDisplay, usdAmountDisplay } from "@app/utils/currencyConversion"
type Props = {
  amount: number
  currency: CurrencyType
  style: TextStyle
  satsIconSize?: number
  iconColor: string
}

const ComponentStyle = EStyleSheet.create({
  view: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
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
          style={{ fill: iconColor, width: satsIconSize, height: satsIconSize }}
        />
        <Text style={style}>{satAmountDisplay(amount)}</Text>
      </View>
    )
  }
  return null
}

export const TextCurrency: ComponentType = ({
  view,
  ...props
}: {
  view: "BtcWallet" | "UsdWallet" | "UsdBalance" | "BtcWalletInUsd"
  currency: CurrencyType
  style: TextStyle
  satsIconSize?: number
  iconColor: string
}) => {
  const { btcWalletBalance, btcWalletValueInUsd, usdWalletBalance } = useWalletBalance()

  switch (view) {
    case "BtcWallet":
      return <TextCurrencyForAmount amount={btcWalletBalance} {...props} />
    case "UsdWallet":
      return <TextCurrencyForAmount amount={usdWalletBalance / 100} {...props} />
    case "UsdBalance":
      return (
        <TextCurrencyForAmount
          amount={usdWalletBalance / 100 + btcWalletValueInUsd}
          {...props}
        />
      )
    case "BtcWalletInUsd":
      return <TextCurrencyForAmount amount={btcWalletValueInUsd} {...props} />
  }
}
