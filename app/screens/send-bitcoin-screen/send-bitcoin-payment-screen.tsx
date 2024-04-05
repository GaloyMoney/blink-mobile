import LottieView from "lottie-react-native"
import React, { useEffect, useRef, useState } from "react"
import { Animated, BackHandler, Dimensions, Easing, View } from "react-native"
import ReactNativeHapticFeedback from "react-native-haptic-feedback"

import errored from "@app/assets/animations/error.json"
import lnSuccess from "@app/assets/animations/lightning_success.json"
import onchainSuccess from "@app/assets/animations/onchain_success.json"
import sendingLoop from "@app/assets/animations/send_loop.json"
import sendingStart from "@app/assets/animations/send_start.json"
import sendingTransition from "@app/assets/animations/send_transition.json"
import LogoDarkMode from "@app/assets/logo/app-logo-dark.svg"
import LogoLightMode from "@app/assets/logo/blink-logo-light.svg"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"
import { GaloySecondaryButton } from "@app/components/atomic/galoy-secondary-button"
import { Screen } from "@app/components/screen"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { logPaymentResult } from "@app/utils/analytics"
import crashlytics from "@react-native-firebase/crashlytics"
import { RouteProp, useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { Text, makeStyles, useTheme } from "@rneui/themed"

import {
  formatTimeToMempool,
  timeToMempool,
} from "../transaction-detail-screen/format-time"
import {
  SendPayment,
  PaymentSendCompletedStatus,
  useSendPayment,
} from "./use-send-payment"

const MIN_ANIMATION_TIME_MS = 1500

const animationMap = {
  START: sendingStart,
  LOOP: sendingLoop,
  TRANSITION: sendingTransition,
  LN_SUCCESS: lnSuccess,
  ONCHAIN_SUCCESS: onchainSuccess,
  ERRORED: errored,
}
type PaymentAnimationState = keyof typeof animationMap
const finalStates: PaymentAnimationState[] = ["LN_SUCCESS", "ONCHAIN_SUCCESS", "ERRORED"]

type Props = {
  route: RouteProp<RootStackParamList, "sendBitcoinPayment">
}

const calculateDuration = (frameCount: number) => (frameCount / 30) * 1000

const SendBitcoinPaymentScreen: React.FC<Props> = ({ route }) => {
  const { LL, locale } = useI18nContext()

  const { paymentDetail } = route.params
  const { sendPayment } = useSendPayment(paymentDetail.sendPaymentMutation)

  const {
    theme: { mode },
  } = useTheme()
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "sendBitcoinPayment">>()

  const styles = useStyles()
  const [paymentAnimationState, setPaymentAnimationState] =
    useState<PaymentAnimationState>("START")

  const [paymentSuccess, setPaymentSuccess] = useState<string | undefined>(undefined)
  const [paymentError, setPaymentError] = useState<string | undefined>(undefined)

  const [paymentResult, setPaymentResult] = useState<Awaited<
    ReturnType<SendPayment>
  > | null>(null)

  useEffect(() => {
    if (!sendPayment) return
    ;(async () => {
      try {
        const data = await sendPayment()
        setPaymentResult(data)
        logPaymentResult({
          paymentStatus: data.status,
          paymentType: route.params.paymentDetail.paymentType,
          sendingWallet: route.params.paymentDetail.sendingWalletDescriptor.currency,
        })
      } catch (err) {
        if (err instanceof Error) {
          crashlytics().recordError(err)

          const indempotencyErrorPattern = /409: Conflict/i
          if (indempotencyErrorPattern.test(err.message)) {
            return setPaymentResult({
              status: "ALREADY_PAID",
              errorsMessage: LL.SendBitcoinConfirmationScreen.paymentAlreadyAttempted(),
              transaction: null,
            })
          }

          return setPaymentResult({
            status: "FAILURE",
            errorsMessage: err.message,
            transaction: null,
          })
        }
      }
    })()
  }, [LL.SendBitcoinConfirmationScreen, route.params, sendPayment])

  const fadeAnim = useRef(new Animated.Value(0)).current

  const [textViewPosition] = useState(new Animated.Value(Dimensions.get("window").height))
  useEffect(() => {
    if (["ONCHAIN_SUCCESS", "ERRORED", "LN_SUCCESS"].includes(paymentAnimationState)) {
      // Animate text view to slide up from the bottom
      setTimeout(() => {
        Animated.timing(textViewPosition, {
          toValue: 10,
          duration: 500,
          easing: Easing.in(Easing.ease),
          useNativeDriver: false, // top animation doesn't run natively
        }).start()
      }, 2000)

      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.in(Easing.ease),
          useNativeDriver: false, // Add this to use native driver for better performance
        }).start()
      }, 2500)
    }
  }, [fadeAnim, paymentAnimationState, textViewPosition])

  const { formatMoneyAmount } = useDisplayCurrency()

  useEffect(() => {
    if (!paymentResult) return

    const { status, errorsMessage, extraInfo } = paymentResult
    const arrivalAtMempoolEstimate = extraInfo?.arrivalAtMempoolEstimate

    if (status === "SUCCESS" || status === "PENDING") {
      ReactNativeHapticFeedback.trigger("notificationSuccess", {
        ignoreAndroidSystemSettings: true,
      })

      switch (processStatus({ arrivalAtMempoolEstimate, status })) {
        case "SUCCESS": {
          const paymentDetail = route.params.paymentDetail
          let address = paymentDetail.destination

          if (paymentDetail.paymentType === "lightning") {
            address = `${address.slice(0, 10)}..${address.slice(-10)}`
          } else if (paymentDetail.paymentType === "onchain") {
            address = `${address.slice(0, 6)}..${address.slice(-6)}`
          }

          const formattedDisplayAmount = formatMoneyAmount({
            moneyAmount: paymentDetail.unitOfAccountAmount,
          })

          const secondaryAmount =
            paymentDetail.settlementAmount.currency ===
            paymentDetail.unitOfAccountAmount.currency
              ? undefined
              : formatMoneyAmount({ moneyAmount: paymentDetail.settlementAmount })

          const amount = `${formattedDisplayAmount}${
            secondaryAmount ? " (" + secondaryAmount + ")" : ""
          }`

          return setPaymentSuccess(
            LL.SendBitcoinPaymentScreen.sent({
              address,
              amount,
            }),
          )
        }
        case "QUEUED":
          return setPaymentSuccess(
            LL.TransactionDetailScreen.txNotBroadcast({
              countdown: formatTimeToMempool(
                timeToMempool(arrivalAtMempoolEstimate as number),
                LL,
                locale,
              ),
            }),
          )
        case "PENDING":
          return setPaymentSuccess(LL.SendBitcoinScreen.pendingPayment())
      }
    } else if (status === "ALREADY_PAID") {
      ReactNativeHapticFeedback.trigger("notificationError", {
        ignoreAndroidSystemSettings: true,
      })
      return setPaymentError(LL.SendBitcoinConfirmationScreen.invoiceAlreadyPaid())
    } else {
      ReactNativeHapticFeedback.trigger("notificationError", {
        ignoreAndroidSystemSettings: true,
      })
      return setPaymentError(errorsMessage || LL.SendBitcoinPaymentScreen.error())
    }
  }, [paymentResult, LL, locale, route.params.paymentDetail, formatMoneyAmount])

  // --- ANIMATION CONTROLLER ---
  const startTime = useRef(Date.now())
  useEffect(() => {
    if (paymentResult && paymentAnimationState === "LOOP") {
      const handleUpdate = () => {
        setPaymentAnimationState("TRANSITION")
        setTimeout(() => {
          if (paymentResult.status === "SUCCESS" || paymentResult.status === "PENDING") {
            const { status, extraInfo } = paymentResult
            const arrivalAtMempoolEstimate = extraInfo?.arrivalAtMempoolEstimate
            setPaymentAnimationState(
              processStatus({ arrivalAtMempoolEstimate, status }) === "QUEUED"
                ? "ONCHAIN_SUCCESS"
                : "LN_SUCCESS",
            )
          } else setPaymentAnimationState("ERRORED")
        }, calculateDuration(35))
      }

      // Even a fews has not passed, show the loop animation and
      // wait there for MIN_ANIMATION_TIME_MS so everything feels reactive
      const timeElapsed = Date.now() - startTime.current
      if (timeElapsed < MIN_ANIMATION_TIME_MS) {
        const t = setTimeout(() => handleUpdate(), MIN_ANIMATION_TIME_MS - timeElapsed)
        return () => clearTimeout(t)
      }
      handleUpdate()
    }
  }, [paymentResult, paymentAnimationState, route.params.paymentDetail.paymentType])

  // Should not be able to go back until the payment has been sent
  useEffect(() => {
    if (finalStates.includes(paymentAnimationState)) return
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => true)
    return () => backHandler.remove()
  }, [paymentAnimationState])

  // Handle transitions to loops
  const handleAnimationFinish = () => {
    if (paymentAnimationState === "START") {
      setPaymentAnimationState("LOOP")
    }
  }

  const Logo = mode === "dark" ? LogoDarkMode : LogoLightMode

  const onPressHome = () =>
    navigation.reset({
      index: 0,
      routes: [{ name: "Primary" }],
    })
  const onPressTransactionDetails = () =>
    navigation.reset({
      routes: [
        {
          name: "Primary",
        },
        {
          name: "transactionDetail",
          params: {
            txid: paymentResult?.transaction?.id,
          },
        },
      ],
    })

  return (
    <Screen keyboardOffset="navigationHeader" keyboardShouldPersistTaps="handled">
      <View style={styles.screenStyle}>
        <View style={styles.animView}>
          {Object.entries(animationMap).map(([state, source]) => (
            <LottieView
              key={state}
              style={[styles.animView, paymentAnimationState !== state && styles.hidden]}
              source={source}
              autoPlay={paymentAnimationState === state}
              loop={state === "LOOP"}
              speed={state === "START" || state === "LOOP" ? 1.5 : 1}
              onAnimationFinish={() =>
                paymentAnimationState === state && handleAnimationFinish()
              }
            />
          ))}
        </View>
        <Animated.View style={[styles.txInfo, { top: textViewPosition }]}>
          {paymentSuccess && (
            <Text type="h1" style={styles.center}>
              {paymentSuccess}
            </Text>
          )}
          {paymentError && (
            <Text type="h1" style={styles.center}>
              {paymentError}
            </Text>
          )}
        </Animated.View>
        <Animated.View
          style={[
            styles.staticContent,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Logo height={60} />
          {finalStates.includes(paymentAnimationState) && (
            <View>
              {paymentResult?.transaction?.id && (
                <GaloySecondaryButton
                  containerStyle={styles.bottomSpacing}
                  title={LL.SendBitcoinPaymentScreen.details()}
                  onPress={onPressTransactionDetails}
                />
              )}
              <GaloyPrimaryButton onPress={onPressHome} title={LL.HomeScreen.title()} />
            </View>
          )}
        </Animated.View>
      </View>
    </Screen>
  )
}

// TODO: proper type from the backend so we don't need this processing in the front end
// ie: it should return QUEUED for an onchain send payment
type StatusProcessed = "SUCCESS" | "PENDING" | "QUEUED"

const processStatus = ({
  status,
  arrivalAtMempoolEstimate,
}: {
  status: PaymentSendCompletedStatus
  arrivalAtMempoolEstimate: number | undefined
}): StatusProcessed => {
  if (status === "SUCCESS") {
    return "SUCCESS"
  }

  if (arrivalAtMempoolEstimate) {
    return "QUEUED"
  }
  return "PENDING"
}

const useStyles = makeStyles(() => ({
  animView: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    transform: [{ scale: calculateScale() }],
  },
  hidden: {
    width: 0,
    height: 0,
    position: "absolute",
    opacity: 0,
  },
  txInfo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    marginTop: 30,
    paddingHorizontal: 50,
  },
  center: {
    textAlign: "center",
    lineHeight: 35,
  },
  staticContent: {
    position: "absolute",
    top: 0,
    zIndex: 10,
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignContent: "center",
    padding: 12,
    paddingTop: 16,
  },
  bottomSpacing: {
    marginBottom: 12,
  },
  screenStyle: {
    position: "relative",
    width: "100%",
    height: "100%",
  },
}))

const calculateScale = () => {
  const screen = Dimensions.get("window")
  const screenAspectRatio = screen.width / screen.height
  const animationAspectRatio = 9 / 16
  return screenAspectRatio > animationAspectRatio
    ? screen.width / (screen.height * animationAspectRatio)
    : screen.height / (screen.width / animationAspectRatio)
}

export default SendBitcoinPaymentScreen
