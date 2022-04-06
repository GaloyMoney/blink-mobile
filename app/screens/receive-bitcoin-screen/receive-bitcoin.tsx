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
    flex: 1,
    justifyContent: "center",
  },
  usdActive: {
    backgroundColor: palette.violetteBlue,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    width: "150rem",
    height: "30rem",
    margin: "5rem",
  },
  btcActive: {
    backgroundColor: palette.orangePill,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    width: "150rem",
    height: "30rem",
    margin: "5rem",
  },
  activeTabText: {
    color: palette.white,
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
const ReceiveBitcoin = ({ navigation }) => {
  const [receiveCurrency, setReceiveCurrency] = useState<CurrencyType>(CurrencyType.USD)

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
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
      </View>
      <View style={styles.screenContainer}>
        {receiveCurrency === CurrencyType.USD && <ReceiveUsd navigation={navigation} />}
        {receiveCurrency === CurrencyType.BTC && <ReceiveBtc navigation={navigation} />}
      </View>
    </View>
  )
}

export default ReceiveBitcoin
