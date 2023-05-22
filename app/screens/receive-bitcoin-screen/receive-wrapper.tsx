import { gql } from "@apollo/client"
import { Screen } from "@app/components/screen"
import {
  useRealtimePriceQuery,
  useReceiveWrapperScreenQuery,
  WalletCurrency,
} from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useI18nContext } from "@app/i18n/i18n-react"
import { requestNotificationPermission } from "@app/utils/notifications"
import { useIsFocused, useNavigation } from "@react-navigation/native"
import React, { useEffect, useState } from "react"
import { View } from "react-native"
import { TouchableWithoutFeedback } from "react-native-gesture-handler"
import { testProps } from "../../utils/testProps"
import { MyLnUpdateSub } from "./my-ln-updates-sub"
import ReceiveBtc from "./receive-btc"
import ReceiveUsd from "./receive-usd"
import { makeStyles, Text } from "@rneui/themed"

const useStyles = makeStyles(({ colors }) => ({
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
    backgroundColor: colors.usdSecondary,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    width: 150,
    height: 30,
    margin: 5,
  },
  btcActive: {
    backgroundColor: colors.btcSecondary,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    width: 150,
    height: 30,
    margin: 5,
  },
  inactiveTab: {
    backgroundColor: colors.grey4,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    width: 150,
    height: 30,
    margin: 5,
  },
}))

gql`
  query receiveWrapperScreen {
    me {
      id
      defaultAccount {
        id
        defaultWallet @client {
          walletCurrency
        }
      }
    }
  }
`

const ReceiveWrapperScreen = () => {
  const styles = useStyles()
  const navigation = useNavigation()

  const isAuthed = useIsAuthed()

  const { data } = useReceiveWrapperScreenQuery({
    fetchPolicy: "cache-first",
    skip: !isAuthed,
  })

  // forcing price refresh
  useRealtimePriceQuery({
    fetchPolicy: "network-only",
    skip: !isAuthed,
  })

  const defaultCurrency = data?.me?.defaultAccount?.defaultWallet?.walletCurrency

  const [receiveCurrency, setReceiveCurrency] = useState<WalletCurrency>(
    defaultCurrency || WalletCurrency.Btc,
  )

  const { LL } = useI18nContext()
  const isFocused = useIsFocused()

  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (isAuthed && isFocused) {
      const WAIT_TIME_TO_PROMPT_USER = 5000
      timeout = setTimeout(
        requestNotificationPermission, // no op if already requested
        WAIT_TIME_TO_PROMPT_USER,
      )
    }

    return () => timeout && clearTimeout(timeout)
  }, [isAuthed, isFocused])

  useEffect(() => {
    if (receiveCurrency === WalletCurrency.Usd) {
      navigation.setOptions({ title: LL.ReceiveWrapperScreen.usdTitle() })
    }

    if (receiveCurrency === WalletCurrency.Btc) {
      navigation.setOptions({ title: LL.ReceiveWrapperScreen.title() })
    }
  }, [receiveCurrency, navigation, LL])

  return (
    <MyLnUpdateSub>
      <Screen style={styles.container}>
        <View style={styles.tabRow}>
          <TouchableWithoutFeedback
            onPress={() => setReceiveCurrency(WalletCurrency.Btc)}
          >
            <View
              style={
                receiveCurrency === WalletCurrency.Btc
                  ? styles.btcActive
                  : styles.inactiveTab
              }
            >
              <Text type="p2" bold={true}>
                BTC
              </Text>
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback
            {...testProps("USD Invoice Button")}
            onPress={() => setReceiveCurrency(WalletCurrency.Usd)}
          >
            <View
              style={
                receiveCurrency === WalletCurrency.Usd
                  ? styles.usdActive
                  : styles.inactiveTab
              }
            >
              <Text type="p2" bold={true}>
                USD
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
        {receiveCurrency === WalletCurrency.Usd && <ReceiveUsd />}
        {receiveCurrency === WalletCurrency.Btc && <ReceiveBtc />}
      </Screen>
    </MyLnUpdateSub>
  )
}

export default ReceiveWrapperScreen
