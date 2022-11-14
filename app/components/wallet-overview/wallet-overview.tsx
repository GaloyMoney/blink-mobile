import { palette } from "@app/theme"
import React, { useState } from "react"
import { Platform, TouchableHighlight, View } from "react-native"
import { Text } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { TextCurrencyForAmount } from "../text-currency"
import TransferIcon from "@app/assets/icons/transfer.svg"
import Icon from "react-native-vector-icons/Ionicons"
import { TouchableWithoutFeedback } from "react-native-gesture-handler"
import { useHideBalance } from "@app/hooks"

const styles = EStyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    marginHorizontal: 30,
  },
  balanceLeft: {
    flex: 3,
    height: 50,
    backgroundColor: palette.white,
    borderRadius: 10,
    marginRight: -10,
    flexDirection: "row",
  },
  balanceRight: {
    flex: 3,
    height: 50,
    backgroundColor: palette.white,
    borderRadius: 10,
    marginLeft: -10,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  textPrimary: {
    fontSize: 17,
    fontWeight: "600",
    color: palette.black,
  },
  textRight: {
    textAlign: "right",
    marginRight: 8,
    flexDirection: "column",
    justifyContent: "center",
  },
  textLeft: {
    marginLeft: 8,
    paddingVertical: 4,
    flexDirection: "column",
    justifyContent: "center",
  },
  textSecondary: {
    fontSize: 10,
    color: palette.darkGrey,
  },
  usdLabelContainer: {
    height: 50,
    backgroundColor: palette.usdSecondary,
    borderBottomRightRadius: 10,
    borderTopRightRadius: 10,
    justifyContent: "center",
  },
  usdLabelText: {
    transform: [{ rotate: "90deg" }],
    color: palette.usdPrimary,
    textAlign: "center",
    fontWeight: "bold",
    letterSpacing: 0.41,
  },
  btcLabelContainer: {
    backgroundColor: palette.btcSecondary,
    borderBottomLeftRadius: 10,
    borderTopLeftRadius: 10,
    height: 50,
    justifyContent: "center",
  },
  btcLabelText: {
    transform: [{ rotate: "-90deg" }],
    color: palette.btcPrimary,
    textAlign: "center",
    fontWeight: "bold",
    letterSpacing: 0.41,
    opacity: 100,
  },
  transferButton: {
    alignItems: "center",
    backgroundColor: palette.lightGrey,
    borderRadius: 50,
    elevation: Platform.OS === "android" ? 50 : 0,
    height: 50,
    justifyContent: "center",
    width: 50,
    zIndex: 50,
  },
  hiddenBalanceIcon: {
    fontSize: "25rem",
    width: 75,
    textAlign: "center",
  },
})

const HidableArea = ({ hidden, style, children }) => {
  const [visible, setVisible] = useState<boolean>(!hidden)

  return (
    <TouchableHighlight
      style={style}
      underlayColor="#ffffff00"
      onPress={() => setVisible((v) => !v)}
    >
      <>{visible ? children : <Icon style={styles.hiddenBalanceIcon} name="eye" />}</>
    </TouchableHighlight>
  )
}

type WalletOverviewProps = {
  navigateToTransferScreen: () => void
  btcWalletBalance: number
  btcWalletValueInUsd: number
  usdWalletBalance: number
}

const WalletOverview = ({
  navigateToTransferScreen,
  btcWalletBalance,
  btcWalletValueInUsd,
  usdWalletBalance,
}: WalletOverviewProps) => {
  const defaultHideBalance = useHideBalance()

  return (
    <View style={styles.container}>
      <View style={styles.balanceLeft}>
        <View style={styles.btcLabelContainer}>
          <Text style={styles.btcLabelText}>SAT</Text>
        </View>

        <HidableArea
          key={`BTC-hide-balance-${defaultHideBalance}`}
          hidden={defaultHideBalance}
          style={styles.textLeft}
        >
          <TextCurrencyForAmount
            amount={btcWalletValueInUsd}
            currency={"CRC"}
            style={styles.textPrimary}
          />
          <TextCurrencyForAmount
            amount={btcWalletBalance}
            currency={"BTC"}
            style={styles.textSecondary}
            satsIconSize={14}
          />
        </HidableArea>
      </View>

      <View style={styles.transferButton}>
        <TouchableWithoutFeedback onPress={navigateToTransferScreen}>
          <TransferIcon />
        </TouchableWithoutFeedback>
      </View>

      <View style={styles.balanceRight}>
        <HidableArea
          key={`USD-hide-balance-${defaultHideBalance}`}
          hidden={defaultHideBalance}
          style={styles.textRight}
        >
          <TextCurrencyForAmount
            amount={usdWalletBalance / 100}
            currency={"USD"}
            style={styles.textPrimary}
          />
        </HidableArea>

        <View style={styles.usdLabelContainer}>
          <Text style={styles.usdLabelText}>USD</Text>
        </View>
      </View>
    </View>
  )
}

export default WalletOverview
