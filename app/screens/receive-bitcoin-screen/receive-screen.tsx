import { gql } from "@apollo/client"
import { Screen } from "@app/components/screen"
import {
  useRealtimePriceQuery,
  useReceiveScreenQuery,
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
import { makeStyles, Text, useTheme } from "@rneui/themed"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { getDefaultWallet } from "@app/graphql/wallets-utils"

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
    backgroundColor: colors.green,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    width: 150,
    height: 30,
    margin: 5,
  },
  btcActive: {
    backgroundColor: colors.primary,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    width: 150,
    height: 30,
    margin: 5,
  },
  inactiveTab: {
    backgroundColor: colors.grey3,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    width: 150,
    height: 30,
    margin: 5,
  },
}))

gql`
  query receiveScreen {
    me {
      id
      defaultAccount {
        id
        wallets {
          id
          balance
          walletCurrency
        }
        defaultWalletId
      }
    }
  }

  query receiveBtc {
    globals {
      network
      feesInformation {
        deposit {
          minBankFee
          minBankFeeThreshold
        }
      }
    }
    me {
      id
      defaultAccount {
        id
        wallets {
          id
          balance
          walletCurrency
        }
      }
    }
  }

  query receiveUsd {
    globals {
      network
    }
    me {
      id
      defaultAccount {
        id
        wallets {
          id
          balance
          walletCurrency
        }
      }
    }
  }
`

const ReceiveScreen = () => {
  const styles = useStyles()
  const {
    theme: { colors },
  } = useTheme()

  const navigation = useNavigation()

  const isAuthed = useIsAuthed()

  const { data } = useReceiveScreenQuery({
    fetchPolicy: "cache-first",
    skip: !isAuthed,
  })

  // forcing price refresh
  useRealtimePriceQuery({
    fetchPolicy: "network-only",
    skip: !isAuthed,
  })

  const defaultCurrency = getDefaultWallet(
    data?.me?.defaultAccount?.wallets,
    data?.me?.defaultAccount?.defaultWalletId,
  )?.walletCurrency

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
      navigation.setOptions({ title: LL.ReceiveScreen.usdTitle() })
    }

    if (receiveCurrency === WalletCurrency.Btc) {
      navigation.setOptions({ title: LL.ReceiveScreen.title() })
    }
  }, [receiveCurrency, navigation, LL])

  return (
    <MyLnUpdateSub>
      <Screen style={styles.container}>
        <KeyboardAwareScrollView>
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
                <Text type="p2" bold={true} color={colors._white}>
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
                <Text type="p2" bold={true} color={colors._white}>
                  USD
                </Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </KeyboardAwareScrollView>
      </Screen>
    </MyLnUpdateSub>
  )
}

export default ReceiveScreen
