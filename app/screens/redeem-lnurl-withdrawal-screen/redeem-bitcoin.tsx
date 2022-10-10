import { useApolloClient } from "@apollo/client"
import useMainQuery from "@app/hooks/use-main-query"
import useToken from "@app/hooks/use-token"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { palette } from "@app/theme"
import { WalletCurrency } from "@app/types/amounts"
import { hasFullPermissions, requestPermission } from "@app/utils/notifications"
import { StackScreenProps } from "@react-navigation/stack"
import React, { useEffect, useState } from "react"
import { Alert, Platform, Text, View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { TouchableWithoutFeedback } from "react-native-gesture-handler"
import RedeemBtc from "./redeem-btc"

const styles = EStyleSheet.create({
  container: {
    flexDirection: "column",
  },
  tabRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "center",
    marginTop: 12,
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
})
const RedeemBitcoinScreen = ({
  navigation,
  route,
}: StackScreenProps<RootStackParamList, "redeemBitcoin">) => {
  const client = useApolloClient()
  const { hasToken } = useToken()
  const { callback, domain, defaultDescription, k1, minWithdrawable, maxWithdrawable } =
    route.params || {}
  const minWithdrawableSatoshis = minWithdrawable / 1_000
  const maxWithdrawableSatoshis = maxWithdrawable / 1_000
  const { usdWalletId } = useMainQuery()
  const [receiveCurrency, setReceiveCurrency] = useState<WalletCurrency>(
    WalletCurrency.BTC,
  )
  const { LL } = useI18nContext()

  useEffect(() => {
    if (receiveCurrency === WalletCurrency.USD) {
      navigation.setOptions({ title: LL.RedeemBitcoinScreen.usdTitle() })
    }

    if (receiveCurrency === WalletCurrency.BTC) {
      navigation.setOptions({ title: LL.RedeemBitcoinScreen.title() })
    }
  }, [receiveCurrency, navigation, LL])

  useEffect(() => {
    const notifRequest = async () => {
      const waitUntilAuthorizationWindow = 5000

      if (Platform.OS === "ios") {
        if (await hasFullPermissions()) {
          return
        }

        setTimeout(
          () =>
            Alert.alert(
              LL.common.notification(),
              LL.ReceiveBitcoinScreen.activateNotifications(),
              [
                {
                  text: LL.common.later(),
                  // todo: add analytics
                  onPress: () => console.log("Cancel/Later Pressed"),
                  style: "cancel",
                },
                {
                  text: LL.common.ok(),
                  onPress: () => hasToken && requestPermission(client),
                },
              ],
              { cancelable: true },
            ),
          waitUntilAuthorizationWindow,
        )
      }
    }
    notifRequest()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, hasToken])

  // if (!usdWalletId) {
  //   return <RedeemBtc
  //     callback={callback}
  //     domain={domain}
  //     k1={k1}
  //     defaultDescription={defaultDescription}
  //     minWithdrawableSatoshis={ minWithdrawableSatoshis }
  //     maxWithdrawableSatoshis={ maxWithdrawableSatoshis }
  //   />
  // }

  return (
    <View style={styles.container}>
      {usdWalletId && (
        <View style={styles.tabRow}>
          <TouchableWithoutFeedback
            onPress={() => setReceiveCurrency(WalletCurrency.BTC)}
          >
            <View
              style={
                receiveCurrency === WalletCurrency.BTC
                  ? styles.btcActive
                  : styles.inactiveTab
              }
            >
              <Text
                style={
                  receiveCurrency === WalletCurrency.BTC
                    ? styles.activeTabText
                    : styles.inactiveTabText
                }
              >
                BTC
              </Text>
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback
            onPress={() => setReceiveCurrency(WalletCurrency.USD)}
          >
            <View
              style={
                receiveCurrency === WalletCurrency.USD
                  ? styles.usdActive
                  : styles.inactiveTab
              }
            >
              <Text
                style={
                  receiveCurrency === WalletCurrency.USD
                    ? styles.activeTabText
                    : styles.inactiveTabText
                }
              >
                USD
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      )}

      {/* {receiveCurrency === WalletCurrency.USD && <ReceiveUsd />}
      {receiveCurrency === WalletCurrency.BTC && <RedeemBtc />} */}
      <RedeemBtc
        callback={callback}
        domain={domain}
        k1={k1}
        defaultDescription={defaultDescription}
        minWithdrawableSatoshis={minWithdrawableSatoshis}
        maxWithdrawableSatoshis={maxWithdrawableSatoshis}
      />
    </View>
  )
}

export default RedeemBitcoinScreen
