import { WalletCurrency } from "@app/graphql/generated"
import { palette } from "@app/theme"
import React, { FunctionComponent } from "react"
import { StyleSheet, Text, View } from "react-native"

const styles = StyleSheet.create({
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
      backgroundColor: palette.opaqueOrangePill,
    },
    USD: {
      textColor: palette.violetteBlue,
      backgroundColor: palette.opaqueVioletteBlue,
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
