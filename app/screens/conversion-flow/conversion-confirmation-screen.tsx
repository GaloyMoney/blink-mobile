import React, { useEffect, useState } from "react"
import { ActivityIndicator, ScrollView, Text, View } from "react-native"

import { Screen } from "@app/components/screen"
import {
  useAccountDefaultWalletLazyQuery,
  useSendBitcoinDestinationQuery,
  WalletCurrency,
} from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { SATS_PER_BTC, usePriceConversion } from "@app/hooks"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { DisplayCurrency, toBtcMoneyAmount } from "@app/types/amounts"
import {
  logConversionAttempt,
  logConversionResult,
  logParseDestinationResult,
} from "@app/utils/analytics"
import { toastShow } from "@app/utils/toast"
import crashlytics from "@react-native-firebase/crashlytics"
import { CommonActions } from "@react-navigation/native"
import { makeStyles } from "@rneui/themed"
import ReactNativeHapticFeedback from "react-native-haptic-feedback"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"

import { useReceiveBitcoin } from "../receive-bitcoin-screen/use-receive-bitcoin"

import { parseDestination } from "../send-bitcoin-screen/payment-destination"
import { LNURL_DOMAINS } from "@app/config"

import { PaymentDetail } from "../send-bitcoin-screen/payment-details"
import { useConvert } from "./use-convert"
import { StackScreenProps } from "@react-navigation/stack"
import { PaymentRequestState } from "../receive-bitcoin-screen/payment/index.types"
import { paymentEvents } from "@app/utils/breez-sdk"

type Props = StackScreenProps<RootStackParamList, "conversionConfirmation">

export const ConversionConfirmationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { toWallet, fromWallet, moneyAmount } = route.params
  const styles = useStyles()
  const isAuthed = useIsAuthed()
  const { LL } = useI18nContext()
  const { formatMoneyAmount, displayCurrency } = useDisplayCurrency()
  const { convertMoneyAmount } = usePriceConversion()
  const { sendPayment } = useConvert()

  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [paymentDetail, setPaymentDetail] = useState<PaymentDetail<WalletCurrency>>()

  const [accountDefaultWalletQuery] = useAccountDefaultWalletLazyQuery({
    fetchPolicy: "no-cache",
  })
  const { data } = useSendBitcoinDestinationQuery({
    fetchPolicy: "cache-first",
    returnPartialData: true,
    skip: !isAuthed,
  })

  const initPRParams = {
    defaultWalletDescriptor: {
      currency: toWallet?.walletCurrency,
      id: toWallet?.id,
    },
    unitOfAccountAmount: moneyAmount,
  }
  const request = useReceiveBitcoin(false, initPRParams)

  useEffect(() => {
    if (request) {
      paymentEvents.once("invoicePaid", handlePaymentSuccess)
      return () => {
        paymentEvents.off("invoicePaid", handlePaymentSuccess)
      }
    }
  }, [request])

  useEffect(() => {
    if (request?.state === "Created" && request?.info?.data?.getFullUriFn({})) {
      preparePaymentDetail(request?.info?.data?.getFullUriFn({}))
    }
  }, [request?.state])

  const preparePaymentDetail = async (rawInput: string) => {
    const wallets = data?.me?.defaultAccount.wallets
    const bitcoinNetwork = data?.globals?.network

    if (!bitcoinNetwork || !wallets) return null
    const paymentDestination: any = await parseDestination({
      rawInput,
      myWalletIds: wallets?.map((wallet) => wallet.id) || [],
      bitcoinNetwork,
      lnurlDomains: LNURL_DOMAINS,
      accountDefaultWalletQuery,
    })
    logParseDestinationResult(paymentDestination)

    if (paymentDestination.valid && paymentDestination) {
      let paymentDetail = paymentDestination?.createPaymentDetail({
        convertMoneyAmount: convertMoneyAmount,
        sendingWalletDescriptor: {
          id: fromWallet.id,
          currency: fromWallet.walletCurrency,
        },
      })

      if (
        paymentDetail.sendPaymentMutation ||
        (paymentDetail.paymentType === "lnurl" && paymentDetail.unitOfAccountAmount)
      ) {
        setPaymentDetail(paymentDetail)
        setLoading(false)
      }
    }
  }

  const handlePaymentError = (error: Error) => {
    setLoading(false)
    setErrorMessage(error.message)
    toastShow({ message: error.message })
    ReactNativeHapticFeedback.trigger("notificationError", {
      ignoreAndroidSystemSettings: true,
    })
  }

  const handlePaymentSuccess = () => {
    setLoading(false)
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

  const payWallet = async () => {
    if (paymentDetail && sendPayment) {
      try {
        logConversionAttempt({
          sendingWallet: fromWallet.walletCurrency,
          receivingWallet: toWallet.walletCurrency,
        })
        setLoading(true)
        const { status, errorsMessage } = await sendPayment(
          paymentDetail?.sendPaymentMutation,
          paymentDetail?.destination,
          paymentDetail?.settlementAmount,
          paymentDetail?.memo,
        )
        logConversionResult({
          sendingWallet: fromWallet.walletCurrency,
          receivingWallet: toWallet.walletCurrency,
          paymentStatus: status,
        })
        if (status === "SUCCESS") {
          handlePaymentSuccess()
        } else if (status === "PENDING") {
        } else if (status === "ALREADY_PAID") {
          throw new Error("Invoice is already paid")
        } else {
          throw new Error(errorsMessage || "Something went wrong")
        }
      } catch (err) {
        if (err instanceof Error) {
          crashlytics().recordError(err)
          handlePaymentError(err)
        }
      }
    }
  }

  // @ts-ignore: Unreachable code error
  const fromAmount = convertMoneyAmount(moneyAmount, fromWallet.walletCurrency) // @ts-ignore: Unreachable code error
  const toAmount = convertMoneyAmount(moneyAmount, toWallet.walletCurrency) // @ts-ignore: Unreachable code error
  const convertingAmount = convertMoneyAmount(moneyAmount, DisplayCurrency) // @ts-ignore: Unreachable code error
  const rate = convertMoneyAmount(toBtcMoneyAmount(Number(SATS_PER_BTC)), DisplayCurrency)

  return (
    <Screen>
      <ScrollView style={styles.scrollViewContainer}>
        <View style={styles.conversionInfoCard}>
          <View style={styles.conversionInfoField}>
            <Text style={styles.conversionInfoFieldTitle}>
              {LL.ConversionConfirmationScreen.youreConverting()}
            </Text>
            <Text style={styles.conversionInfoFieldValue}>
              {formatMoneyAmount({ moneyAmount: fromAmount })}
              {displayCurrency !== fromWallet.walletCurrency &&
              displayCurrency !== toWallet.walletCurrency
                ? ` - ${formatMoneyAmount({
                    moneyAmount: convertingAmount,
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
              {toWallet.walletCurrency === WalletCurrency.Btc
                ? LL.common.btcAccount()
                : LL.common.usdAccount()}
            </Text>
          </View>
          <View style={styles.conversionInfoField}>
            <Text style={styles.conversionInfoFieldTitle}>{LL.common.rate()}</Text>
            <Text style={styles.conversionInfoFieldValue}>
              {formatMoneyAmount({
                moneyAmount: rate,
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
      </ScrollView>
      <GaloyPrimaryButton
        title={LL.common.convert()}
        containerStyle={styles.buttonContainer}
        disabled={loading}
        onPress={payWallet}
        loading={loading}
      />
      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size={"large"} color={"#60aa55"} />
        </View>
      )}
    </Screen>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  scrollViewContainer: {
    flexDirection: "column",
  },
  conversionInfoCard: {
    margin: 20,
    backgroundColor: colors.grey5,
    borderRadius: 10,
    padding: 20,
  },
  conversionInfoField: {
    marginBottom: 20,
  },
  conversionInfoFieldTitle: { color: colors.grey1 },
  conversionInfoFieldValue: {
    color: colors.grey0,
    fontWeight: "bold",
    fontSize: 18,
  },
  buttonContainer: { marginHorizontal: 20, marginBottom: 20 },
  errorContainer: {
    marginBottom: 10,
  },
  errorText: {
    color: colors.error,
    textAlign: "center",
  },
  loading: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
}))
