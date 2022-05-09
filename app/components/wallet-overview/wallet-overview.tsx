import { useWalletBalance } from "@app/hooks"
import { palette } from "@app/theme"
import React from "react"
import { Platform, View } from "react-native"
import { Button, Text } from "react-native-elements"
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
    height: 50,
    width: 50,
    borderRadius: 50,
    zIndex: 50,
    elevation: Platform.OS === "android" ? 50 : 0,
    backgroundColor: "rgba(228, 233, 238, 1)",
    justifyContent: "center",
    alignItems: "center",
  },
})

export const WalletOverviewDataInjected = ({ navigation }) => {
  const { usdWalletBalance, btcWalletBalance, btcWalletValueInUsd } = useWalletBalance()
  return (
    <WalletOverview
      usdBalance={usdWalletBalance / 100}
      btcPrimaryBalance={btcWalletValueInUsd}
      btcSecondaryBalance={btcWalletBalance}
      transferButtonAction={() => navigation.navigate("TransferScreen")}
    />
  )
}

const WalletOverview = (props: WalletOverviewProps) => {
  const { usdBalance, btcPrimaryBalance, btcSecondaryBalance, transferButtonAction } =
    props

  return (
    <View style={styles.container}>
      <View style={styles.balanceLeft}>
        <View style={styles.usdLabelContainer}>
          <Text style={styles.usdLabelText}>USD</Text>
        </View>
        <TextCurrency
          amount={usdBalance}
          currency={"USD"}
          style={{ ...styles.textPrimary, ...styles.textLeft}}
        />
      </View>

      <View style={styles.transferButton}>
        <TouchableWithoutFeedback onPress={() => transferButtonAction()}>
          <TransferIcon />
        </TouchableWithoutFeedback>
      </View>

      <View style={styles.balanceRight}>
        <View>

        <TextCurrency
          amount={btcPrimaryBalance}
          currency={"USD"}
          style={{ ...styles.textPrimary, ...styles.textRight }}
        />
        <TextCurrency
          amount={btcSecondaryBalance}
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

export interface WalletOverviewProps {
  usdBalance: number
  btcPrimaryBalance: number
  btcSecondaryBalance: number
  transferButtonAction: () => void
}

export default WalletOverview
