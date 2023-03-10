import React, { useState } from "react"
import { Platform, StyleProp, TouchableHighlight, View, ViewStyle } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { TouchableWithoutFeedback } from "react-native-gesture-handler"
import Icon from "react-native-vector-icons/Ionicons"

import TransferIcon from "@app/assets/icons/transfer.svg"
import {
  useHideBalanceQuery,
  useWalletOverviewScreenQuery,
  WalletCurrency,
} from "@app/graphql/generated"
import { palette } from "@app/theme"
import { testProps } from "@app/utils/testProps"
import { Text } from "@rneui/base"

import { gql } from "@apollo/client"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { toBtcMoneyAmount, toUsdMoneyAmount } from "@app/types/amounts"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
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
  displayTextView: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
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

gql`
  query walletOverviewScreen {
    me {
      defaultAccount {
        id
        btcWallet @client {
          id
          balance
        }
        usdWallet @client {
          id
          balance
        }
      }
    }
  }
`

type Props = {
  loading: boolean
  setModalVisible: (value: boolean) => void
}

const WalletOverview: React.FC<Props> = ({ loading, setModalVisible }) => {
  const isAuthed = useIsAuthed()

  const { data } = useWalletOverviewScreenQuery({ skip: !isAuthed })
  const { formatMoneyAmount, displayCurrency, moneyAmountToDisplayCurrencyString } =
    useDisplayCurrency()

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const navigateToTransferScreen = () => navigation.navigate("conversionDetails")

  const { data: dataHideBalance } = useHideBalanceQuery()
  const hideBalance = dataHideBalance?.hideBalance || false

  let btcInDisplayCurrencyFormatted = "$0.00"
  let usdInDisplayCurrencyFormatted = "$0.00"
  let btcInUnderlyingCurrency = "0 sat"
  let usdInUnderlyingCurrency: string | undefined = undefined

  if (isAuthed) {
    const btcWalletBalance = toBtcMoneyAmount(
      data?.me?.defaultAccount?.btcWallet?.balance ?? NaN,
    )

    const usdWalletBalance = toUsdMoneyAmount(
      data?.me?.defaultAccount?.usdWallet?.balance ?? NaN,
    )

    btcInDisplayCurrencyFormatted =
      moneyAmountToDisplayCurrencyString(btcWalletBalance) ?? "..."

    usdInDisplayCurrencyFormatted =
      moneyAmountToDisplayCurrencyString(usdWalletBalance) ?? "..."

    btcInUnderlyingCurrency = formatMoneyAmount(btcWalletBalance)

    if (displayCurrency !== WalletCurrency.Usd) {
      usdInUnderlyingCurrency = formatMoneyAmount(usdWalletBalance)
    }
  }

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
            <View style={styles.displayTextView}>
              <Text style={styles.textPrimary}>{btcInDisplayCurrencyFormatted}</Text>
            </View>
            <View style={styles.displayTextView}>
              <Text style={styles.textSecondary}>{btcInUnderlyingCurrency}</Text>
            </View>
          </HidableArea>
        )}
      </View>

      <View {...testProps("Transfer Icon")} style={styles.transferButton}>
        <TouchableWithoutFeedback
          onPress={() => (isAuthed ? navigateToTransferScreen : setModalVisible(true))}
        >
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
            <View style={styles.displayTextView}>
              <Text style={styles.textPrimary}>{usdInDisplayCurrencyFormatted}</Text>
            </View>
            {displayCurrency !== WalletCurrency.Usd && (
              <View style={styles.displayTextView}>
                <Text style={styles.textSecondary}>{usdInUnderlyingCurrency}</Text>
              </View>
            )}
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
