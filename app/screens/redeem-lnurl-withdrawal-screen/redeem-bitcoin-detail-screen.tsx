import { useApolloClient } from "@apollo/client"
import useToken from "@app/hooks/use-token"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { hasFullPermissions, requestPermission } from "@app/utils/notifications"
import { StackScreenProps } from "@react-navigation/stack"
import { Alert, Platform, Pressable, View } from "react-native"
import { TouchableWithoutFeedback } from "react-native-gesture-handler"
import { usePriceConversion } from "@app/hooks"
import useMainQuery from "@app/hooks/use-main-query"
import React, { useEffect, useState } from "react"
import { Button, Text } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { FakeCurrencyInput } from "react-native-currency-input"
import { palette } from "@app/theme"
import SwitchIcon from "@app/assets/icons/switch.svg"

import { useI18nContext } from "@app/i18n/i18n-react"
import { WalletCurrency } from "@app/types/amounts"

const styles = EStyleSheet.create({
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

  container: {
    marginTop: "14rem",
    marginLeft: 20,
    marginRight: 20,
  },
  inputForm: {
    marginVertical: 20,
  },
  currencyInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginTop: 10,
    backgroundColor: palette.white,
    borderRadius: 10,
  },
  infoText: {
    color: palette.midGrey,
    fontSize: "12rem",
  },
  withdrawalErrorText: {
    color: palette.red,
    fontSize: "12rem",
  },
  withdrawableDescriptionText: {
    color: palette.midGrey,
    fontSize: "14rem",
    textAlign: "center",
  },
  walletBalanceInput: {
    color: palette.lapisLazuli,
    fontSize: 20,
    fontWeight: "600",
  },
  convertedAmountText: {
    color: palette.coolGrey,
    fontSize: 12,
  },
  switchCurrencyIconContainer: {
    width: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  currencyInput: {
    flexDirection: "column",
    flex: 1,
  },
  toggle: {
    justifyContent: "flex-end",
  },
  button: {
    height: 60,
    borderRadius: 10,
    marginTop: 40,
  },
  activeButtonStyle: {
    backgroundColor: palette.lightBlue,
  },
  activeButtonTitleStyle: {
    color: palette.white,
    fontWeight: "bold",
  },
  disabledButtonStyle: {
    backgroundColor: palette.lighterGrey,
  },
  disabledButtonTitleStyle: {
    color: palette.lightBlue,
    fontWeight: "600",
  },
})
const RedeemBitcoinDetailScreen = ({
  navigation,
  route,
}: StackScreenProps<RootStackParamList, "redeemBitcoinDetail">) => {
  const client = useApolloClient()
  const { hasToken } = useToken()
  const { callback, domain, defaultDescription, k1, minWithdrawable, maxWithdrawable } =
    route.params
  const minWithdrawableSatoshis = minWithdrawable / 1_000
  const maxWithdrawableSatoshis = maxWithdrawable / 1_000

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

  const [satAmount, setSatAmount] = useState(minWithdrawableSatoshis)
  const { convertCurrencyAmount } = usePriceConversion()
  const satAmountInUsd = convertCurrencyAmount({
    amount: satAmount,
    from: "BTC",
    to: "USD",
  })
  const minSatAmountInUsd = convertCurrencyAmount({
    amount: satAmount,
    from: "BTC",
    to: "USD",
  })
  const maxSatAmountInUsd = convertCurrencyAmount({
    amount: satAmount,
    from: "BTC",
    to: "USD",
  })
  const [usdAmount, setUsdAmount] = useState(satAmountInUsd)

  const [amountCurrency, setAmountCurrency] = useState("BTC")

  const { btcWalletId } = useMainQuery()
  const usdWalletId = null // TODO: when usd wallet ln invoices can be generated providing the sats amount as in put we can have the usdWalletId from useMainQuery as follows: const { usdWalletId } = useMainQuery()

  const toggleAmountCurrency = () => {
    if (amountCurrency === "USD") {
      setAmountCurrency("BTC")
    }
    if (amountCurrency === "BTC") {
      setAmountCurrency("USD")
      setUsdAmount(
        convertCurrencyAmount({
          amount: satAmount,
          from: "BTC",
          to: "USD",
        }),
      )
    }
  }

  const updateUSDAmount = (usdAmount) => {
    setUsdAmount(usdAmount)

    setSatAmount(
      Math.min(
        minWithdrawableSatoshis,
        Math.max(
          maxWithdrawable,
          // UsdAmountInSats
          Math.round(
            convertCurrencyAmount({
              amount: usdAmount ?? 0,
              from: "USD",
              to: "BTC",
            }),
          ),
        ),
      ),
    )
  }

  const validAmount =
    (amountCurrency === "BTC" &&
      satAmount !== null &&
      satAmount <= maxWithdrawableSatoshis &&
      satAmount >= minWithdrawableSatoshis) ||
    (amountCurrency === "USD" &&
      usdAmount !== null &&
      satAmount <= maxWithdrawableSatoshis &&
      satAmount >= minWithdrawableSatoshis)

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
      <View style={[styles.inputForm, styles.container]}>
        {defaultDescription && (
          <Text style={styles.withdrawableDescriptionText}>{defaultDescription}</Text>
        )}
        <Text style={[styles.infoText, styles.padding]}>
          {LL.RedeemBitcoinScreen.amountToRedeemFrom({ domain })}
        </Text>
        <View style={styles.currencyInputContainer}>
          <View style={styles.currencyInput}>
            {amountCurrency === "BTC" && (
              <>
                <FakeCurrencyInput
                  value={satAmount}
                  onChangeValue={(newValue) => setSatAmount(newValue)}
                  prefix=""
                  delimiter=","
                  separator="."
                  precision={0}
                  suffix=" sats"
                  minValue={minWithdrawableSatoshis}
                  style={styles.walletBalanceInput}
                  autoFocus
                />
                <Text
                  style={
                    satAmount <= maxWithdrawableSatoshis
                      ? styles.infoText
                      : styles.withdrawalErrorText
                  }
                >
                  {LL.RedeemBitcoinScreen.minMaxRange({
                    minimumAmount: minWithdrawableSatoshis.toString(),
                    maximumAmount: maxWithdrawableSatoshis.toString(),
                    currencyTicker: "sats",
                  })}
                </Text>
                <FakeCurrencyInput
                  value={satAmountInUsd}
                  prefix="$"
                  delimiter=","
                  separator="."
                  precision={2}
                  minValue={minSatAmountInUsd}
                  maxValue={maxSatAmountInUsd}
                  editable={false}
                  style={styles.convertedAmountText}
                />
              </>
            )}
            {amountCurrency === "USD" && (
              <>
                <FakeCurrencyInput
                  value={usdAmount}
                  onChangeValue={(newValue) => {
                    updateUSDAmount(newValue)
                  }}
                  prefix="$"
                  delimiter=","
                  separator="."
                  precision={2}
                  style={styles.walletBalanceInput}
                  minValue={minSatAmountInUsd}
                  maxValue={maxSatAmountInUsd}
                  autoFocus
                />
                <Text
                  style={
                    satAmount <= maxWithdrawableSatoshis
                      ? styles.infoText
                      : styles.withdrawalErrorText
                  }
                >
                  {LL.RedeemBitcoinScreen.minMaxRange({
                    minimumAmount: minSatAmountInUsd.toFixed(2),
                    maximumAmount: maxSatAmountInUsd.toFixed(2),
                    currencyTicker: "USD",
                  })}
                </Text>
                <FakeCurrencyInput
                  value={satAmount}
                  prefix=""
                  delimiter=","
                  separator="."
                  suffix=" sats"
                  precision={0}
                  minValue={0}
                  editable={false}
                  style={styles.convertedAmountText}
                />
              </>
            )}
          </View>

          <View style={styles.toggle}>
            <Pressable onPress={toggleAmountCurrency}>
              <View style={styles.switchCurrencyIconContainer}>
                <SwitchIcon />
              </View>
            </Pressable>
          </View>
        </View>

        <Button
          title={LL.RedeemBitcoinScreen.redeemBitcoin()}
          buttonStyle={[styles.button, styles.activeButtonStyle]}
          titleStyle={styles.activeButtonTitleStyle}
          disabledStyle={[styles.button, styles.disabledButtonStyle]}
          disabledTitleStyle={styles.disabledButtonTitleStyle}
          disabled={!validAmount}
          onPress={() => {
            // if (amountCurrency === "USD" && usdAmount) {
            //   setSatAmount(usdAmountInSats)
            // }
            navigation.navigate("redeemBitcoinConfirmation", {
              callback,
              domain,
              k1,
              defaultDescription,
              minWithdrawableSatoshis,
              maxWithdrawableSatoshis,
              receiveCurrency,
              walletId:
                receiveCurrency === WalletCurrency.BTC ? btcWalletId : usdWalletId,
              satAmount,
              satAmountInUsd,
              amountCurrency,
            })
          }}
        />
      </View>
    </View>
  )
}

export default RedeemBitcoinDetailScreen
