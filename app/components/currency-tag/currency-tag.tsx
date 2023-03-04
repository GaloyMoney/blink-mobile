import { WalletCurrency } from "@app/graphql/generated"
import { palette } from "@app/theme"
import React, { FunctionComponent } from "react"
import { Text, View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"

const styles = EStyleSheet.create({
  currencyTag: {
    borderRadius: 10,
    height: 30,
    width: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  currencyText: {
    fontSize: 12,
  },
})

type CurrencyTagProps = {
  walletCurrency: WalletCurrency
}

export const CurrencyTag: FunctionComponent<CurrencyTagProps> = ({ walletCurrency }) => {
  const currencyStyling = {
    BTC: {
      textColor: palette.orangePill,
      backgroundColor: "rgba(238, 133, 58, 0.2)",
    },
    USD: {
      textColor: palette.violetteBlue,
      backgroundColor: "rgba(99, 116, 195, 0.2)",
    },
  }

  return (
    <View
      style={{
        ...styles.currencyTag,
        backgroundColor: currencyStyling[walletCurrency].backgroundColor,
      }}
    >
      <Text
        style={{
          ...styles.currencyText,
          color: currencyStyling[walletCurrency].textColor,
        }}
      >
        {walletCurrency}
      </Text>
    </View>
  )
}
