import { useApolloClient } from "@apollo/client"
import useToken from "@app/hooks/use-token"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { hasFullPermissions, requestPermission } from "@app/utils/notifications"
import { StackScreenProps } from "@react-navigation/stack"
import { Alert, Platform, View } from "react-native"
import { usePriceConversion } from "@app/hooks"
import { TYPE_LIGHTNING_BTC } from "@app/utils/wallet"
import React, { useEffect, useState } from "react"
import { Button, Text } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { FakeCurrencyInput } from "react-native-currency-input"
import { palette } from "@app/theme"

import { useI18nContext } from "@app/i18n/i18n-react"
import { WalletCurrency } from "@app/types/amounts"

const styles = EStyleSheet.create({
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
  currencyInput: {
    flexDirection: "column",
    flex: 1,
  },
  button: {
    height: 60,
    borderRadius: 10,
    marginTop: 40,
  },
  activeButtonStyle: {
    backgroundColor: palette.lightBlue,
  },
  disabledButtonStyle: {
    backgroundColor: palette.lighterGrey,
  },
  disabledButtonTitleStyle: {
    color: palette.lightBlue,
    fontWeight: "600",
  },
})
const RedeemBitcoinConfirmationScreen = ({
  navigation,
  route,
}: StackScreenProps<RootStackParamList, "redeemBitcoinConfirmation">) => {
  const client = useApolloClient()
  const { hasToken } = useToken()
  const {
    callback,
    domain,
    defaultDescription,
    k1,
    minWithdrawableSatoshis,
    maxWithdrawableSatoshis,
    walletId,
    receiveCurrency,
    satAmount,
    satAmountInUsd,
    amountCurrency,
  } = route.params

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

  const { convertCurrencyAmount } = usePriceConversion()

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
  const usdAmount = satAmountInUsd

  const [showConfirmation, setShowConfirmation] = useState(true) // TODO: If min==max then don't show amountInput...

  const [paymentLayer] = useState<"LIGHTNING_BTC">(TYPE_LIGHTNING_BTC)

  useEffect((): void | (() => void) => {
    if (walletId && !showConfirmation) {
      if (paymentLayer === TYPE_LIGHTNING_BTC) {
        navigation.navigate("redeemBitcoinSuccess", {
          callback,
          domain,
          k1,
          defaultDescription,
          minWithdrawableSatoshis,
          maxWithdrawableSatoshis,
          receiveCurrency,
          walletId,
          satAmount,
          satAmountInUsd,
          amountCurrency,
        })
      }
    }
  }, [walletId, paymentLayer, satAmount, showConfirmation])

  const usdAmountInSats = Math.round(
    convertCurrencyAmount({
      amount: usdAmount ?? 0,
      from: "USD",
      to: "BTC",
    }),
  )

  const validAmount =
    (amountCurrency === "BTC" && satAmount !== null) ||
    (amountCurrency === "USD" && usdAmount !== null)

  return (
    <View style={styles.container}>
      <View style={[styles.inputForm, styles.container]}>
        {defaultDescription && (
          <Text style={styles.withdrawableDescriptionText}>{defaultDescription}</Text>
        )}
        <View style={styles.currencyInputContainer}>
          <View style={styles.currencyInput}>
            {amountCurrency === WalletCurrency.BTC && (
              <>
                <Text style={styles.infoText}>
                  {LL.RedeemBitcoinScreen.redeemAmountFrom({
                    amountToRedeem: satAmount.toString(),
                    currencyTicker: "sats",
                    domain,
                  })}
                </Text>
                <FakeCurrencyInput
                  value={satAmount}
                  prefix=""
                  delimiter=" "
                  separator="."
                  precision={0}
                  suffix=" sats"
                  minValue={minWithdrawableSatoshis}
                  maxValue={maxWithdrawableSatoshis}
                  style={styles.walletBalanceInput}
                  editable={false}
                  autoFocus
                />
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
            {amountCurrency === WalletCurrency.USD && (
              <>
                <Text style={styles.infoText}>
                  {LL.RedeemBitcoinScreen.redeemAmountFrom({
                    amountToRedeem: satAmountInUsd.toFixed(2),
                    currencyTicker: "USD",
                    domain,
                  })}
                </Text>
                <FakeCurrencyInput
                  value={usdAmount}
                  prefix="$"
                  delimiter=","
                  separator="."
                  precision={2}
                  style={styles.walletBalanceInput}
                  minValue={minSatAmountInUsd}
                  maxValue={maxSatAmountInUsd}
                  editable={false}
                  autoFocus
                />
                <FakeCurrencyInput
                  value={usdAmountInSats}
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
        </View>

        <Button
          title={LL.RedeemBitcoinScreen.redeemBitcoin()}
          buttonStyle={[styles.button, styles.activeButtonStyle]}
          titleStyle={styles.activeButtonTitleStyle}
          disabledStyle={[styles.button, styles.disabledButtonStyle]}
          disabledTitleStyle={styles.disabledButtonTitleStyle}
          disabled={!validAmount}
          onPress={() => {
            // TODO: Set invoice and loading...
            setShowConfirmation(false)
          }}
        />
      </View>
    </View>
  )
}

export default RedeemBitcoinConfirmationScreen
