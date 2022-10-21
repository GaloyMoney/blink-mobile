import { useSubscriptionUpdates } from "@app/hooks"
import { useApolloClient } from "@apollo/client"
import useToken from "@app/hooks/use-token"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { hasFullPermissions, requestPermission } from "@app/utils/notifications"
import { StackScreenProps } from "@react-navigation/stack"
import { Alert, Platform, View, ActivityIndicator } from "react-native"
import { GaloyGQL, useMutation } from "@galoymoney/client"
import React, { useCallback, useEffect, useState, useMemo } from "react"
import { Text } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { palette } from "@app/theme"

import { useI18nContext } from "@app/i18n/i18n-react"
import { logGeneratePaymentRequest } from "@app/utils/analytics"
import { WalletCurrency } from "@app/types/amounts"
import fetch from "cross-fetch"
import LottieView from "lottie-react-native"

import { TYPE_LIGHTNING_BTC, TYPE_LIGHTNING_USD } from "../../utils/wallet"

import successLottie from "../send-bitcoin-screen/success_lottie.json"

const styles = EStyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: palette.white,
    height: 380,
    width: "100%",
    borderRadius: 10,
  },
  errorContainer: {
    justifyContent: "center",
    height: "100%",
  },
  errorText: {
    color: palette.red,
    alignSelf: "center",
  },
  lottie: {
    height: "200rem",
    width: "200rem",
  },
  qr: {
    alignItems: "center",
  },
})

const RedeemBitcoinSuccessScreen = ({
  navigation,
  route,
}: StackScreenProps<RootStackParamList, "redeemBitcoinSuccess">) => {
  const client = useApolloClient()
  const { hasToken } = useToken()
  const {
    callback,
    domain,
    defaultDescription,
    k1,
    walletId,
    receiveCurrency,
    satAmount,
    satAmountInUsd,
  } = route.params

  const type =
    receiveCurrency === WalletCurrency.BTC ? TYPE_LIGHTNING_BTC : TYPE_LIGHTNING_USD

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

  const [err, setErr] = useState("")
  const [withdrawalInvoice, setInvoice] = useState<GaloyGQL.LnInvoice | null>(null)

  const [memo] = useState(defaultDescription)

  const { lnUpdate } = useSubscriptionUpdates()
  const invoicePaid =
    lnUpdate?.paymentHash === withdrawalInvoice?.paymentHash &&
    lnUpdate?.status === "PAID"

  const [lnInvoiceCreate] = useMutation.lnInvoiceCreate()
  const [lnUsdInvoiceCreate] = useMutation.lnUsdInvoiceCreate()

  const createWithdrawRequestInvoice = useCallback(
    async ({ satAmount, memo }) => {
      setInvoice(null)
      try {
        if (type === TYPE_LIGHTNING_BTC) {
          logGeneratePaymentRequest({
            paymentType: "lightning",
            hasAmount: true,
            receivingWallet: WalletCurrency.BTC,
          })
          const {
            data: {
              lnInvoiceCreate: { invoice, errors },
            },
          } = await lnInvoiceCreate({
            variables: {
              input: { walletId, amount: satAmount, memo },
            },
          })
          if (errors && errors.length !== 0) {
            console.error(errors, "error with lnInvoiceCreate")
            setErr(LL.RedeemBitcoinScreen.error())
            return
          }

          setInvoice(invoice)
        } else {
          logGeneratePaymentRequest({
            paymentType: "lightning",
            hasAmount: true,
            receivingWallet: WalletCurrency.USD,
          })
          const {
            data: {
              lnUsdInvoiceCreate: { invoice, errors },
            },
          } = await lnUsdInvoiceCreate({
            variables: {
              input: { walletId, amount: satAmountInUsd * 100, memo },
            },
          })

          if (errors && errors.length !== 0) {
            console.error(errors, "error with lnInvoiceCreate")
            setErr(LL.ReceiveBitcoinScreen.error())
            return
          }
          setInvoice(invoice)
        }
      } catch (err) {
        console.error(err, "error with AddInvoice")
        setErr(`${err}`)
        throw err
      }
    },
    [lnInvoiceCreate, lnUsdInvoiceCreate, LL],
  )

  const submitLNURLWithdrawRequest = async (generatedInvoice) => {
    const url = `${callback}${callback.includes("?") ? "&" : "?"}k1=${k1}&pr=${
      generatedInvoice.paymentRequest
    }`

    const result = await fetch(url)

    if (result.ok) {
      const lnurlResponse = await result.json()
      if (lnurlResponse?.status?.toLowerCase() === "ok") {
        // TODO: Set processing payment
      } else {
        console.error(lnurlResponse, "error with redeeming")
        // TODO: Set failed payment
        setErr(LL.RedeemBitcoinScreen.redeemingError())
      }
    } else {
      console.error(result.text(), "error with submitting withdrawalRequest")
      setErr(LL.RedeemBitcoinScreen.submissionError())
    }
  }

  useEffect((): void | (() => void) => {
    if (withdrawalInvoice) {
      submitLNURLWithdrawRequest(withdrawalInvoice)
    } else {
      createWithdrawRequestInvoice({ satAmount, memo })
    }
  }, [walletId, withdrawalInvoice, memo, type, satAmount, createWithdrawRequestInvoice])

  const renderSuccessView = useMemo(() => {
    if (invoicePaid) {
      return (
        <View style={styles.container}>
          <LottieView
            source={successLottie}
            loop={false}
            autoPlay
            style={styles.lottie}
            resizeMode="cover"
          />
        </View>
      )
    }
    return null
  }, [invoicePaid])

  const renderStatusView = useMemo(() => {
    if (err !== "") {
      return (
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText} selectable>
              {err}
            </Text>
          </View>
        </View>
      )
    } else if (!invoicePaid) {
      return (
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <ActivityIndicator size="large" color={palette.blue} />
          </View>
        </View>
      )
    }
    return null
  }, [err, invoicePaid])

  return (
    <>
      <View style={styles.qr}>
        <Text style={styles.infoText}>
          redeem {satAmount} sats from {domain}
        </Text>
        {renderSuccessView}
        {renderStatusView}
      </View>
    </>
  )
}

export default RedeemBitcoinSuccessScreen
