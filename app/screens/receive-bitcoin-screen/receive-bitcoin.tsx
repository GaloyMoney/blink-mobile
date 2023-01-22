import { Screen } from "@app/components/screen"
import useToken from "@app/hooks/use-token"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { palette } from "@app/theme"
import { requestNotificationPermission } from "@app/utils/notifications"
import { useIsFocused } from "@react-navigation/native"
import { StackScreenProps } from "@react-navigation/stack"
import React, { useEffect, useState } from "react"
import { Text, View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { TouchableWithoutFeedback } from "react-native-gesture-handler"
import ReceiveBtc from "./receive-btc"
import ReceiveUsd from "./receive-usd"
import { WalletCurrency, useReceiveBitcoinScreenQuery } from "@app/graphql/generated"
import { gql } from "@apollo/client"

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

gql`
  query receiveBitcoinScreen {
    me {
      id
      defaultAccount {
        id
        defaultWallet @client {
          walletCurrency
        }
        usdWallet @client {
          id
        }
      }
    }
  }
`

// FIXME ReceiveBitcoinScreen and ReceiveBTC are confusing names
// how do they differ?
const ReceiveBitcoinScreen = ({
  navigation,
  route,
}: StackScreenProps<RootStackParamList, "receiveBitcoin">) => {
  const { hasToken } = useToken()
  const { receiveCurrency: initialReceiveCurrency } = route.params || {}

  const { data } = useReceiveBitcoinScreenQuery({ fetchPolicy: "cache-first" })

  const defaultCurrency = data?.me?.defaultAccount?.defaultWallet?.walletCurrency
  const usdWalletId = data?.me?.defaultAccount?.usdWallet?.id

  const [receiveCurrency, setReceiveCurrency] = useState<WalletCurrency>(
    initialReceiveCurrency || defaultCurrency || WalletCurrency.Usd,
  )
  const { LL } = useI18nContext()
  const isFocused = useIsFocused()

  useEffect(() => {
    let timeout
    if (hasToken && isFocused) {
      const WAIT_TIME_TO_PROMPT_USER = 2000
      timeout = setTimeout(
        requestNotificationPermission, // no op if already requested
        WAIT_TIME_TO_PROMPT_USER,
      )
    }

    return () => timeout && clearTimeout(timeout)
  }, [hasToken, isFocused])

  useEffect(() => {
    if (receiveCurrency === WalletCurrency.Usd) {
      navigation.setOptions({ title: LL.ReceiveBitcoinScreen.usdTitle() })
    }

    if (receiveCurrency === WalletCurrency.Btc) {
      navigation.setOptions({ title: LL.ReceiveBitcoinScreen.title() })
    }
  }, [receiveCurrency, navigation, LL])

  if (!usdWalletId) {
    return <ReceiveBtc />
  }

  return (
    <Screen style={styles.container}>
      <View style={styles.tabRow}>
        <TouchableWithoutFeedback onPress={() => setReceiveCurrency(WalletCurrency.Btc)}>
          <View
            style={
              receiveCurrency === WalletCurrency.Btc
                ? styles.btcActive
                : styles.inactiveTab
            }
          >
            <Text
              style={
                receiveCurrency === WalletCurrency.Btc
                  ? styles.activeTabText
                  : styles.inactiveTabText
              }
            >
              BTC
            </Text>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={() => setReceiveCurrency(WalletCurrency.Usd)}>
          <View
            style={
              receiveCurrency === WalletCurrency.Usd
                ? styles.usdActive
                : styles.inactiveTab
            }
          >
            <Text
              style={
                receiveCurrency === WalletCurrency.Usd
                  ? styles.activeTabText
                  : styles.inactiveTabText
              }
            >
              USD
            </Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
      {receiveCurrency === WalletCurrency.Usd && <ReceiveUsd />}
      {receiveCurrency === WalletCurrency.Btc && <ReceiveBtc />}
    </Screen>
  )
}

export default ReceiveBitcoinScreen
