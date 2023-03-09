import React, { useState } from "react"
import { Platform, StyleProp, TouchableHighlight, View, ViewStyle } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { TouchableWithoutFeedback } from "react-native-gesture-handler"
import Icon from "react-native-vector-icons/Ionicons"

import TransferIcon from "@app/assets/icons/transfer.svg"
import { useHideBalanceQuery } from "@app/graphql/generated"
import { palette } from "@app/theme"
import { testProps } from "@app/utils/testProps"
import { Text } from "@rneui/base"

import { TextCurrencyForAmount } from "../text-currency"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import ContentLoader, { Rect } from "react-content-loader/native"

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
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})

type HidableAreaProps = {
  hidden: boolean
  style: StyleProp<ViewStyle>
  children: React.ReactNode
}

const Loader = () => (
  <View style={styles.loaderContainer}>
    <ContentLoader
      height={"70%"}
      width={"70%"}
      speed={1.2}
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
    >
      <Rect x="0" y="0" rx="4" ry="4" width="100%" height="100%" />
    </ContentLoader>
  </View>
)

const HidableArea = ({ hidden, style, children }: HidableAreaProps) => {
  const [visible, setVisible] = useState(!hidden)

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

type Props = {
  loading: boolean
  btcWalletBalance: number
  btcWalletValueInDisplayCurrency: number
  usdWalletBalanceInDisplayCurrency: number
}

const WalletOverview: React.FC<Props> = ({
  loading,
  btcWalletBalance,
  btcWalletValueInDisplayCurrency,
  usdWalletBalanceInDisplayCurrency,
}) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const navigateToTransferScreen = () => navigation.navigate("conversionDetails")

  const { data } = useHideBalanceQuery()
  const hideBalance = data?.hideBalance || false

  return (
    <View style={styles.container}>
      <View style={styles.balanceLeft}>
        <View style={styles.btcLabelContainer}>
          <Text style={styles.btcLabelText}>SAT</Text>
        </View>
        {loading ? (
          <Loader />
        ) : (
          <HidableArea
            key={`BTC-hide-balance-${hideBalance}`}
            hidden={hideBalance}
            style={styles.textLeft}
          >
            <TextCurrencyForAmount
              amount={btcWalletValueInDisplayCurrency}
              currency={"display"}
              style={styles.textPrimary}
            />
            <TextCurrencyForAmount
              amount={btcWalletBalance}
              currency={"BTC"}
              style={styles.textSecondary}
              satsIconSize={14}
            />
          </HidableArea>
        )}
      </View>

      <View {...testProps("Transfer Icon")} style={styles.transferButton}>
        <TouchableWithoutFeedback onPress={navigateToTransferScreen}>
          <TransferIcon />
        </TouchableWithoutFeedback>
      </View>

      <View style={styles.balanceRight}>
        {loading ? (
          <Loader />
        ) : (
          <HidableArea
            key={`USD-hide-balance-${hideBalance}`}
            hidden={hideBalance}
            style={styles.textRight}
          >
            <TextCurrencyForAmount
              amount={usdWalletBalanceInDisplayCurrency}
              currency={"display"}
              style={styles.textPrimary}
            />
          </HidableArea>
        )}

        <View style={styles.usdLabelContainer}>
          <Text style={styles.usdLabelText}>USD</Text>
        </View>
      </View>
    </View>
  )
}

export default WalletOverview
