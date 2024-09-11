import React from "react"
import { View } from "react-native"
import { makeStyles, Text } from "@rneui/themed"
import { useI18nContext } from "@app/i18n/i18n-react"

// types
import { Wallet, WalletCurrency } from "@app/graphql/generated"
import {
  DisplayCurrency,
  MoneyAmount,
  toBtcMoneyAmount,
  WalletOrDisplayCurrency,
} from "@app/types/amounts"

// hooks
import { SATS_PER_BTC, useDisplayCurrency, usePriceConversion } from "@app/hooks"

type Props = {
  toWallet: Pick<Wallet, "id" | "walletCurrency" | "balance">
  fromWallet: Pick<Wallet, "id" | "walletCurrency" | "balance">
  moneyAmount: MoneyAmount<WalletOrDisplayCurrency>
}

const ConfirmationDetails: React.FC<Props> = ({ fromWallet, toWallet, moneyAmount }) => {
  const styles = useStyles()
  const { LL } = useI18nContext()
  const { formatMoneyAmount, displayCurrency } = useDisplayCurrency()
  const { convertMoneyAmount } = usePriceConversion()

  // @ts-ignore: Unreachable code error
  const fromAmount = convertMoneyAmount(moneyAmount, fromWallet.walletCurrency) // @ts-ignore: Unreachable code error
  const toAmount = convertMoneyAmount(moneyAmount, toWallet.walletCurrency) // @ts-ignore: Unreachable code error
  const convertingAmount = convertMoneyAmount(moneyAmount, DisplayCurrency) // @ts-ignore: Unreachable code error
  const rate = convertMoneyAmount(toBtcMoneyAmount(Number(SATS_PER_BTC)), DisplayCurrency)

  return (
    <View style={styles.conversionInfoCard}>
      <View style={styles.conversionInfoField}>
        <Text style={styles.conversionInfoFieldTitle}>
          {LL.ConversionConfirmationScreen.youreConverting()}
        </Text>
        <Text style={styles.conversionInfoFieldValue}>
          {formatMoneyAmount({ moneyAmount: fromAmount })}
          {displayCurrency !== fromWallet.walletCurrency &&
          displayCurrency !== toWallet.walletCurrency
            ? ` - ${formatMoneyAmount({
                moneyAmount: convertingAmount,
              })}`
            : ""}
        </Text>
      </View>
      <View style={styles.conversionInfoField}>
        <Text style={styles.conversionInfoFieldTitle}>{LL.common.to()}</Text>
        <Text style={styles.conversionInfoFieldValue}>
          {formatMoneyAmount({ moneyAmount: toAmount, isApproximate: true })}
        </Text>
      </View>
      <View style={styles.conversionInfoField}>
        <Text style={styles.conversionInfoFieldTitle}>
          {LL.ConversionConfirmationScreen.receivingAccount()}
        </Text>
        <Text style={styles.conversionInfoFieldValue}>
          {toWallet.walletCurrency === WalletCurrency.Btc
            ? LL.common.btcAccount()
            : LL.common.usdAccount()}
        </Text>
      </View>
      <View style={styles.conversionInfoField}>
        <Text style={styles.conversionInfoFieldTitle}>{LL.common.rate()}</Text>
        <Text style={styles.conversionInfoFieldValue}>
          {formatMoneyAmount({
            moneyAmount: rate,
            isApproximate: true,
          })}{" "}
          / 1 BTC
        </Text>
      </View>
    </View>
  )
}

export default ConfirmationDetails

const useStyles = makeStyles(({ colors }) => ({
  conversionInfoCard: {
    margin: 20,
    backgroundColor: colors.grey5,
    borderRadius: 10,
    padding: 20,
  },
  conversionInfoField: {
    marginBottom: 20,
  },
  conversionInfoFieldTitle: { color: colors.grey1 },
  conversionInfoFieldValue: {
    color: colors.grey0,
    fontWeight: "bold",
    fontSize: 18,
  },
}))
