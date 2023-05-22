import { WalletCurrency } from "@app/graphql/generated"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { useI18nContext } from "@app/i18n/i18n-react"
import { palette } from "@app/theme"
import { WalletAmount } from "@app/types/amounts"
import React, { FunctionComponent } from "react"
import { View } from "react-native"
import { CurrencyTag } from "../currency-tag"
import { Text, makeStyles } from "@rneui/themed"

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

export const WalletSummary: FunctionComponent<WalletSummaryProps> = ({
  settlementAmount,
  txDisplayAmount,
  txDisplayCurrency,
  amountType = "BALANCE",
}) => {
  const styles = useStyles()
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
    currencyCode: txDisplayCurrency,
  })

  const secondaryAmount =
    settlementAmount.currency === txDisplayCurrency
      ? undefined
      : formatMoneyAmount({ moneyAmount: settlementAmount })

  const amounts = secondaryAmount
    ? formattedDisplayAmount + ` (${secondaryAmount})`
    : formattedDisplayAmount

  return (
    <View style={styles.walletSummaryContainer}>
      <View style={styles.currencyTagContainer}>
        <CurrencyTag walletCurrency={settlementAmount.currency} />
      </View>
      <View style={styles.amountsContainer}>
        <Text type={"p2"}>{currencySpecificValues.walletName}</Text>
        <Text>
          {amountTypeToSymbol[amountType] ? `${amountTypeToSymbol[amountType]} ` : ""}
          {amounts}
        </Text>
      </View>
    </View>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  walletSummaryContainer: {
    backgroundColor: colors.grey4,
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
}))
