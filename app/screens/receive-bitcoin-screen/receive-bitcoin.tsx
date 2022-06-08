import useMainQuery from "@app/hooks/use-main-query"
import { palette } from "@app/theme"
import React, { useState } from "react"
import { Text, View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { TouchableWithoutFeedback } from "react-native-gesture-handler"
import ReceiveBtc from "./receive-btc"
import ReceiveUsd from "./receive-usd"

const CurrencyType = {
  USD: "USD",
  BTC: "BTC",
} as const

const styles = EStyleSheet.create({
  container: {
    flexDirection: "column",
    padding: 10,
    flex: 6,
  },
  tabRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "center",
    height: "50rem",
  },
  usdActive: {
    backgroundColor: palette.usdSecondary,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    width: "150rem",
    height: "30rem",
    margin: "5rem",
  },
  btcActive: {
    backgroundColor: palette.btcSecondary,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    width: "150rem",
    height: "30rem",
    margin: "5rem",
  },
  activeTabText: {
    color: palette.darkGrey,
  },
  inactiveTab: {
    backgroundColor: palette.white,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    width: "150rem",
    height: "30rem",
    margin: "5rem",
  },
  inactiveTabText: {
    color: palette.coolGrey,
  },
  screenContainer: {
    flex: 5,
  },
})
const ReceiveBitcoin = () => {
  const { usdWalletId } = useMainQuery()
  const [receiveCurrency, setReceiveCurrency] = useState<CurrencyType>(CurrencyType.BTC)

  if (!usdWalletId) {
    return <ReceiveBtc />
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        <TouchableWithoutFeedback onPress={() => setReceiveCurrency(CurrencyType.BTC)}>
          <View
            style={
              receiveCurrency === CurrencyType.BTC ? styles.btcActive : styles.inactiveTab
            }
          >
            <Text
              style={
                receiveCurrency === CurrencyType.BTC
                  ? styles.activeTabText
                  : styles.inactiveTabText
              }
            >
              BTC
            </Text>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={() => setReceiveCurrency(CurrencyType.USD)}>
          <View
            style={
              receiveCurrency === CurrencyType.USD ? styles.usdActive : styles.inactiveTab
            }
          >
            <Text
              style={
                receiveCurrency === CurrencyType.USD
                  ? styles.activeTabText
                  : styles.inactiveTabText
              }
            >
              USD
            </Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
      <View style={styles.screenContainer}>
        {receiveCurrency === CurrencyType.USD && <ReceiveUsd />}
        {receiveCurrency === CurrencyType.BTC && <ReceiveBtc />}
      </View>
    </View>
  )
}

export default ReceiveBitcoin
