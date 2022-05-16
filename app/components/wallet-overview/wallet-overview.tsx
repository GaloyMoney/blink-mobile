import { palette } from "@app/theme"
import React from "react"
import { Platform, View } from "react-native"
import { Text } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { TextCurrency } from "../text-currency"
import TransferIcon from "@app/assets/icons/transfer.svg"
import { TouchableWithoutFeedback } from "react-native-gesture-handler"

const styles = EStyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    padding: 30,
  },
  balanceLeft: {
    flex: 3,
    height: 50,
    backgroundColor: palette.white,
    borderRadius: 10,
    marginRight: -10,
    flexDirection:"row",
  },
  balanceRight: {
    flex: 3,
    height: 50,
    backgroundColor: palette.white,
    borderRadius: 10,
    marginLeft: -10,
    flexDirection:"row",
    justifyContent: 'flex-end'
  },
  textPrimary: {
    fontSize: 20,
    fontWeight: "600",
    color: palette.black
  },
  textRight: {
    textAlign: "right",
    marginRight: 10,
  },
  textLeft: {
    marginLeft: 10,
    lineHeight: 50,
  },
  textSecondary: {
    fontSize: 12,
    color: palette.darkGrey
  },
  usdLabelContainer: {
    height: 50,
    backgroundColor: palette.usdSecondary,
    borderBottomLeftRadius: 10,
    borderTopLeftRadius: 10,
    justifyContent: "center"
  },
  usdLabelText: {
    transform: [{ rotate: "-90deg" }],
    color: palette.usdPrimary,
    textAlign: "center",
    fontWeight: "bold",
    letterSpacing: 0.41,
  },
  btcLabelContainer: {
    height: 50,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: "rgba(241, 164, 60, 0.5)",
    justifyContent: "center"
  },
  btcLabelText: {
    transform: [{ rotate: "90deg" }],
    color: palette.btcPrimary,
    textAlign: "center",
    fontWeight: "bold",
    letterSpacing: 0.41,
    opacity: 100,
  },
  transferButton: {
    alignItems: "center",
    backgroundColor: "rgba(228, 233, 238, 1)",
    borderRadius: 50,
    elevation: Platform.OS === "android" ? 50 : 0,
    height: 50,
    justifyContent: "center",
    width: 50,
    zIndex: 50,
  },
})

const WalletOverview = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.balanceLeft}>
        <View style={styles.usdLabelContainer}>
          <Text style={styles.usdLabelText}>USD</Text>
        </View>
        <TextCurrency
          view="UsdWallet"
          currency={"USD"}
          style={{ ...styles.textPrimary, ...styles.textLeft}}
        />
      </View>

      <View style={styles.transferButton}>
        <TouchableWithoutFeedback onPress={() => navigation.navigate("TransferScreen")}>
          <TransferIcon />
        </TouchableWithoutFeedback>
      </View>

      <View style={styles.balanceRight}>
        <View>
          <TextCurrency
            view="BtcWalletInUsd"
            currency={"USD"}
            style={{ ...styles.textPrimary, ...styles.textRight }}
          />
          <TextCurrency
            view="BtcWallet"
            currency={"BTC"}
            style={{ ...styles.textSecondary, ...styles.textRight }}
            satsIconSize={15}
          />
        </View>
        <View style={styles.btcLabelContainer}>
          <Text style={styles.btcLabelText}>SAT</Text>
        </View>
      </View>
    </View>
  )
}

export default WalletOverview
