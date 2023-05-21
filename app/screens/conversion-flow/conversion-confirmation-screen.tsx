import { GraphQLError } from "graphql"
import React, { useState } from "react"
import { Text, View } from "react-native"

import { Screen } from "@app/components/screen"
import {
  HomeAuthedDocument,
  PaymentSendResult,
  useConversionScreenQuery,
  useIntraLedgerPaymentSendMutation,
  useIntraLedgerUsdPaymentSendMutation,
  WalletCurrency,
} from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { getErrorMessages } from "@app/graphql/utils"
import { SATS_PER_BTC, usePriceConversion } from "@app/hooks"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { palette } from "@app/theme"
import { DisplayCurrency, toBtcMoneyAmount } from "@app/types/amounts"
import { WalletDescriptor } from "@app/types/wallets"
import { logConversionAttempt, logConversionResult } from "@app/utils/analytics"
import { testProps } from "@app/utils/testProps"
import { toastShow } from "@app/utils/toast"
import crashlytics from "@react-native-firebase/crashlytics"
import {
  CommonActions,
  NavigationProp,
  RouteProp,
  useNavigation,
} from "@react-navigation/native"
import { Button } from "@rneui/base"
import { makeStyles } from "@rneui/themed"
import ReactNativeHapticFeedback from "react-native-haptic-feedback"

const useStyles = makeStyles((theme) => ({
  screen: {
    flex: 1,
    flexDirection: "column",
    paddingVertical: 10,
  },
  conversionInfoCard: {
    margin: 20,
    backgroundColor: theme.colors.whiteOrDarkGrey,
    borderRadius: 10,
    padding: 20,
  },
  conversionInfoField: {
    marginBottom: 20,
  },
  conversionInfoFieldTitle: { color: theme.colors.grey1 },
  conversionInfoFieldValue: {
    color: theme.colors.grey0,
    fontWeight: "bold",
    fontSize: 18,
  },
  button: {
    height: 60,
    borderRadius: 10,
    marginBottom: 20,
    marginTop: 20,
    backgroundColor: palette.lightBlue,
    color: palette.white,
    fontWeight: "bold",
  },
  buttonTitleStyle: {
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
  buttonContainer: {
    flex: 1,
    justifyContent: "flex-end",
    marginHorizontal: 20,
  },
  errorContainer: {
    marginBottom: 10,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: "center",
  },
  background: {
    color: theme.colors.lighterGreyOrBlack,
  },
}))

type Props = {
  route: RouteProp<RootStackParamList, "conversionConfirmation">
}

export const ConversionConfirmationScreen: React.FC<Props> = ({ route }) => {
  const styles = useStyles()
  const navigation =
    useNavigation<NavigationProp<RootStackParamList, "conversionConfirmation">>()

  const { formatMoneyAmount, displayCurrency } = useDisplayCurrency()
  const { convertMoneyAmount } = usePriceConversion()

  const { fromWalletCurrency, moneyAmount } = route.params
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const isAuthed = useIsAuthed()

  const [intraLedgerPaymentSend, { loading: intraLedgerPaymentSendLoading }] =
    useIntraLedgerPaymentSendMutation()
  const [intraLedgerUsdPaymentSend, { loading: intraLedgerUsdPaymentSendLoading }] =
    useIntraLedgerUsdPaymentSendMutation()
  const isLoading = intraLedgerPaymentSendLoading || intraLedgerUsdPaymentSendLoading
  const { LL } = useI18nContext()

  let fromWallet: WalletDescriptor<WalletCurrency>
  let toWallet: WalletDescriptor<WalletCurrency>

  const { data } = useConversionScreenQuery({
    fetchPolicy: "cache-first",
    skip: !isAuthed,
  })

  const usdWallet = data?.me?.defaultAccount.usdWallet
  const btcWallet = data?.me?.defaultAccount.btcWallet

  if (!data?.me || !usdWallet || !btcWallet || !convertMoneyAmount) {
    // TODO: handle errors and or provide some loading state
    return null
  }

  if (fromWalletCurrency === WalletCurrency.Btc) {
    fromWallet = { id: btcWallet.id, currency: WalletCurrency.Btc }
    toWallet = { id: usdWallet.id, currency: WalletCurrency.Usd }
  } else {
    fromWallet = { id: usdWallet.id, currency: WalletCurrency.Usd }
    toWallet = { id: btcWallet.id, currency: WalletCurrency.Btc }
  }

  const fromAmount = convertMoneyAmount(moneyAmount, fromWallet.currency)
  const toAmount = convertMoneyAmount(moneyAmount, toWallet.currency)

  const handlePaymentReturn = (
    status: PaymentSendResult,
    errorsMessage: readonly GraphQLError[] | string | undefined,
  ) => {
    if (status === "SUCCESS") {
      // navigate to next screen
      navigation.dispatch((state) => {
        const routes = [{ name: "Primary" }, { name: "conversionSuccess" }]
        return CommonActions.reset({
          ...state,
          routes,
          index: routes.length - 1,
        })
      })
      ReactNativeHapticFeedback.trigger("notificationSuccess", {
        ignoreAndroidSystemSettings: true,
      })
    }

    if (typeof errorsMessage === "string") {
      setErrorMessage(errorsMessage)
      ReactNativeHapticFeedback.trigger("notificationError", {
        ignoreAndroidSystemSettings: true,
      })
    } else if (errorsMessage?.length) {
      setErrorMessage(getErrorMessages(errorsMessage))
      ReactNativeHapticFeedback.trigger("notificationError", {
        ignoreAndroidSystemSettings: true,
      })
    }
  }

  const handlePaymentError = (error: Error) => {
    console.error(error)
    toastShow({ message: error.message })
  }

  const payWallet = async () => {
    if (fromWallet.currency === WalletCurrency.Btc) {
      try {
        logConversionAttempt({
          sendingWallet: fromWallet.currency,
          receivingWallet: toWallet.currency,
        })
        const { data, errors } = await intraLedgerPaymentSend({
          variables: {
            input: {
              walletId: fromWallet?.id,
              recipientWalletId: toWallet?.id,
              amount: fromAmount.amount,
            },
          },
          refetchQueries: [HomeAuthedDocument],
        })

        const status = data?.intraLedgerPaymentSend.status

        if (!status) {
          throw new Error("Conversion failed")
        }

        logConversionResult({
          sendingWallet: fromWallet.currency,
          receivingWallet: toWallet.currency,
          paymentStatus: status,
        })
        handlePaymentReturn(
          status,
          errors || data?.intraLedgerPaymentSend.errors[0]?.message,
        )
      } catch (err) {
        if (err instanceof Error) {
          crashlytics().recordError(err)
          handlePaymentError(err)
        }
      }
    }
    if (fromWallet.currency === WalletCurrency.Usd) {
      try {
        logConversionAttempt({
          sendingWallet: fromWallet.currency,
          receivingWallet: toWallet.currency,
        })
        const { data, errors } = await intraLedgerUsdPaymentSend({
          variables: {
            input: {
              walletId: fromWallet?.id,
              recipientWalletId: toWallet?.id,
              amount: fromAmount.amount,
            },
          },
          refetchQueries: [HomeAuthedDocument],
        })

        const status = data?.intraLedgerUsdPaymentSend.status

        if (!status) {
          throw new Error("Conversion failed")
        }

        logConversionResult({
          sendingWallet: fromWallet.currency,
          receivingWallet: toWallet.currency,
          paymentStatus: status,
        })
        handlePaymentReturn(
          status,
          errors || data?.intraLedgerUsdPaymentSend.errors[0]?.message,
        )
      } catch (err) {
        if (err instanceof Error) {
          crashlytics().recordError(err)
          handlePaymentError(err)
        }
      }
    }
  }

  return (
    <Screen style={styles.screen} backgroundColor={styles.background.color}>
      <View style={styles.conversionInfoCard}>
        <View style={styles.conversionInfoField}>
          <Text style={styles.conversionInfoFieldTitle}>
            {LL.ConversionConfirmationScreen.youreConverting()}
          </Text>
          <Text style={styles.conversionInfoFieldValue}>
            {formatMoneyAmount({ moneyAmount: fromAmount })}
            {displayCurrency !== fromWallet.currency &&
            displayCurrency !== toWallet.currency
              ? ` - ${formatMoneyAmount({
                  moneyAmount: convertMoneyAmount(moneyAmount, DisplayCurrency),
                })}`
              : ""}
          </Text>
        </View>
        <View style={styles.conversionInfoField}>
          <Text style={styles.conversionInfoFieldTitle}>{LL.common.to()}</Text>
          <Text style={styles.conversionInfoFieldValue}>
            {formatMoneyAmount({ moneyAmount: toAmount, isApproximate: true })}
          </Text>
        </View>
        <View style={styles.conversionInfoField}>
          <Text style={styles.conversionInfoFieldTitle}>
            {LL.ConversionConfirmationScreen.receivingAccount()}
          </Text>
          <Text style={styles.conversionInfoFieldValue}>
            {toWallet.currency === WalletCurrency.Btc
              ? LL.common.btcAccount()
              : LL.common.usdAccount()}
          </Text>
        </View>
        <View style={styles.conversionInfoField}>
          <Text style={styles.conversionInfoFieldTitle}>{LL.common.rate()}</Text>
          <Text style={styles.conversionInfoFieldValue}>
            {formatMoneyAmount({
              moneyAmount: convertMoneyAmount(
                toBtcMoneyAmount(Number(SATS_PER_BTC)),
                DisplayCurrency,
              ),
              isApproximate: true,
            })}{" "}
            / 1 BTC
          </Text>
        </View>
      </View>
      {errorMessage && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}
      <Button
        {...testProps(LL.common.convert())}
        title={LL.common.convert()}
        buttonStyle={styles.button}
        containerStyle={styles.buttonContainer}
        titleStyle={styles.buttonTitleStyle}
        disabledStyle={[styles.button, styles.disabledButtonStyle]}
        disabledTitleStyle={styles.disabledButtonTitleStyle}
        disabled={isLoading}
        onPress={payWallet}
        loading={isLoading}
      />
    </Screen>
  )
}
