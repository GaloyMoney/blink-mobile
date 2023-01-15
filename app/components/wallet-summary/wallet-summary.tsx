import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { palette } from "@app/theme"
import { satAmountDisplay } from "@app/utils/currencyConversion"
import { WalletType } from "@app/utils/enum"
import React, { FunctionComponent } from "react"
import { Text, View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { CurrencyTag } from "../currency-tag"

type WalletSummaryProps = {
  walletType: WalletType
  usdBalanceInDollars: number
  btcBalanceInSats?: number
  amountType: "RECEIVE" | "SEND" | "BALANCE"
}

const amountTypeToSymbol = {
  RECEIVE: "+",
  SEND: "-",
  BALANCE: "",
}

const styles = EStyleSheet.create({
  walletSummaryContainer: {
    backgroundColor: palette.white,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
  },
  amountsContainer: {
    margin: 8,
  },
  currencyTagContainer: {
    margin: 8,
  },
  walletTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
})

export const WalletSummary: FunctionComponent<WalletSummaryProps> = ({
  walletType,
  usdBalanceInDollars,
  btcBalanceInSats,
  amountType = "BALANCE",
}) => {
  const { formatToDisplayCurrency } = useDisplayCurrency()
  const currencySpecificValues =
    walletType === WalletType.BTC
      ? {
          currencyName: "BTC",
          currencyColor: palette.btcPrimary,
          walletName: "Bitcoin Wallet",
        }
      : {
          currencyName: "USD",
          currencyColor: palette.usdPrimary,
          walletName: "US Dollar Wallet",
        }

  const formattedUsdAmount = formatToDisplayCurrency(usdBalanceInDollars)

  const formattedBtcAmount = btcBalanceInSats ? satAmountDisplay(btcBalanceInSats) : ""

  const amounts = formattedBtcAmount
    ? formattedUsdAmount + " - " + formattedBtcAmount
    : formattedUsdAmount

  return (
    <View style={styles.walletSummaryContainer}>
      <View style={styles.currencyTagContainer}>
        <CurrencyTag walletType={walletType} />
      </View>
      <View style={styles.amountsContainer}>
        <Text style={styles.walletTitle}>{currencySpecificValues.walletName}</Text>
        <Text>
          {amountTypeToSymbol[amountType] ? `${amountTypeToSymbol[amountType]} ` : ""}
          {amounts}
        </Text>
      </View>
    </View>
  )
}
