import { WalletCurrency } from "@app/graphql/generated"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { useI18nContext } from "@app/i18n/i18n-react"
import { palette } from "@app/theme"
import { WalletAmount } from "@app/types/amounts"
import React, { FunctionComponent } from "react"
import { StyleSheet, Text, View } from "react-native"
import { CurrencyTag } from "../currency-tag"

type WalletSummaryProps = {
  settlementAmount: WalletAmount<WalletCurrency>
  txDisplayAmount: string | number
  txDisplayCurrency: string
  amountType: "RECEIVE" | "SEND" | "BALANCE"
}

const amountTypeToSymbol = {
  RECEIVE: "+",
  SEND: "-",
  BALANCE: "",
}

const styles = StyleSheet.create({
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
  const { LL } = useI18nContext()

  const { formatMoneyAmount, formatCurrency } = useDisplayCurrency()
  const currencySpecificValues =
    settlementAmount.currency === WalletCurrency.Btc
      ? {
          currencyName: "BTC",
          currencyColor: palette.btcPrimary,
          walletName: LL.common.btcAccount(),
        }
      : {
          currencyName: "USD",
          currencyColor: palette.usdPrimary,
          walletName: LL.common.usdAccount(),
        }

  const formattedDisplayAmount = formatCurrency({
    amountInMajorUnits: txDisplayAmount,
    currency: txDisplayCurrency,
    withSign: false,
  })

  const secondaryAmount =
    settlementAmount.currency === txDisplayCurrency
      ? undefined
      : formatMoneyAmount({ moneyAmount: settlementAmount })

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
