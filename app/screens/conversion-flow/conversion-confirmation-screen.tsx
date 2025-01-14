import React, { useEffect, useState } from "react"
import { ActivityIndicator, ScrollView, Text, View } from "react-native"
import ReactNativeHapticFeedback from "react-native-haptic-feedback"
import crashlytics from "@react-native-firebase/crashlytics"
import { StackScreenProps } from "@react-navigation/stack"
import { CommonActions } from "@react-navigation/native"
import { useI18nContext } from "@app/i18n/i18n-react"
import { makeStyles } from "@rneui/themed"

// components
import { Screen } from "@app/components/screen"
import { ConfirmationDetails } from "@app/components/swap-flow"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"

// gql
import {
  useAccountDefaultWalletLazyQuery,
  useSendBitcoinDestinationQuery,
  WalletCurrency,
} from "@app/graphql/generated"

// hooks
import { useReceiveBitcoin } from "../receive-bitcoin-screen/use-receive-bitcoin"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { usePriceConversion } from "@app/hooks"
import { useConvert } from "./use-convert"

// utils
import {
  logConversionAttempt,
  logConversionResult,
  logParseDestinationResult,
} from "@app/utils/analytics"
import { toastShow } from "@app/utils/toast"
import { parseDestination } from "../send-bitcoin-screen/payment-destination"
import { LNURL_DOMAINS } from "@app/config"

// types
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { PaymentDetail } from "../send-bitcoin-screen/payment-details"

type Props = StackScreenProps<RootStackParamList, "conversionConfirmation">

export const ConversionConfirmationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { toWallet, fromWallet, moneyAmount } = route.params
  const { LL } = useI18nContext()
  const styles = useStyles()
  const isAuthed = useIsAuthed()
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
  const request = useReceiveBitcoin(initPRParams)

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
        if (status === "SUCCESS" || status === "PENDING") {
          handlePaymentSuccess()
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

  return (
    <Screen>
      <ScrollView style={styles.scrollViewContainer}>
        <ConfirmationDetails
          fromWallet={fromWallet}
          toWallet={toWallet}
          moneyAmount={moneyAmount}
        />
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
