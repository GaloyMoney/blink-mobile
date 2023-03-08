import { WalletCurrency } from "@app/graphql/generated"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { palette } from "@app/theme"
import { PaymentAmount } from "@app/types/amounts"
import React, { FunctionComponent } from "react"
import { Text, View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { CurrencyTag } from "../currency-tag"

type WalletSummaryProps = {
  settlementAmount: PaymentAmount<WalletCurrency>
  txDisplayAmount: string | number
  txDisplayCurrency: string
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
  settlementAmount,
  txDisplayAmount,
  txDisplayCurrency,
  amountType = "BALANCE",
}) => {
  const { formatMoneyAmount, formatCurrency } = useDisplayCurrency()
  const currencySpecificValues =
    settlementAmount.currency === WalletCurrency.Btc
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

  const formattedDisplayAmount = formatCurrency({
    amountInMajorUnits: txDisplayAmount,
    currency: txDisplayCurrency,
    withSign: false,
  })

  const secondaryAmount =
    settlementAmount.currency === txDisplayCurrency
      ? undefined
      : formatMoneyAmount(settlementAmount)

  const amounts = secondaryAmount
    ? formattedDisplayAmount + " - " + secondaryAmount
    : formattedDisplayAmount

  return (
    <View style={styles.walletSummaryContainer}>
      <View style={styles.currencyTagContainer}>
        <CurrencyTag walletCurrency={settlementAmount.currency} />
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
