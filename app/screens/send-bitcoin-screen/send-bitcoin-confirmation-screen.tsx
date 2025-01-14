import React, { useCallback, useEffect, useState } from "react"
import { View } from "react-native"
import { makeStyles } from "@rneui/themed"
import { useI18nContext } from "@app/i18n/i18n-react"
import crashlytics from "@react-native-firebase/crashlytics"
import { StackScreenProps } from "@react-navigation/stack"
import ReactNativeHapticFeedback from "react-native-haptic-feedback"

// components
import {
  ConfirmationDestinationAmountNote,
  ConfirmationError,
  ConfirmationWalletFee,
  SendingAnimation,
} from "@app/components/send-flow"
import { Screen } from "@app/components/screen"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"

// hooks
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { useSendPayment } from "./use-send-payment"
import { useAppConfig, useBreez } from "@app/hooks"
import { useIsAuthed } from "@app/graphql/is-authed-context"

// types
import {
  addMoneyAmounts,
  DisplayCurrency,
  lessThanOrEqualTo,
  moneyAmountIsCurrencyType,
  toBtcMoneyAmount,
  toUsdMoneyAmount,
  ZeroBtcMoneyAmount,
  ZeroUsdMoneyAmount,
} from "@app/types/amounts"
import {
  useSendBitcoinConfirmationScreenQuery,
  WalletCurrency,
} from "@app/graphql/generated"
import { FeeType } from "./use-fee"
import { RootStackParamList } from "@app/navigation/stack-param-lists"

// utils
import { logPaymentAttempt, logPaymentResult } from "@app/utils/analytics"
import { getUsdWallet } from "@app/graphql/wallets-utils"

type Props = {} & StackScreenProps<RootStackParamList, "sendBitcoinConfirmation">

const SendBitcoinConfirmationScreen: React.FC<Props> = ({ route, navigation }) => {
  const { paymentDetail, flashUserAddress, feeRateSatPerVbyte } = route.params
  const {
    destination,
    paymentType,
    sendingWalletDescriptor,
    sendPaymentMutation,
    settlementAmount,
    isSendingMax,
    memo: note,
    convertMoneyAmount,
  } = paymentDetail

  const styles = useStyles()
  const { LL } = useI18nContext()
  const { lnAddressHostname: lnDomain } = useAppConfig().appConfig.galoyInstance
  const { formatDisplayAndWalletAmount } = useDisplayCurrency()
  const { btcWallet } = useBreez()

  const [usdWalletText, setUsdWalletText] = useState("")
  const [btcWalletText, setBtcWalletText] = useState("")
  const [isValidAmount, setIsValidAmount] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [paymentError, setPaymentError] = useState<string>()
  const [invalidAmountErr, setInvalidAmountErr] = useState<string>()
  const [fee, setFee] = useState<FeeType>({ status: "loading" })

  const { data } = useSendBitcoinConfirmationScreenQuery({ skip: !useIsAuthed() })
  const usdWallet = getUsdWallet(data?.me?.defaultAccount?.wallets)

  const convertedDestination =
    sendingWalletDescriptor.currency === "BTC" && paymentType === "intraledger"
      ? destination + `@${lnDomain}`
      : destination

  const {
    loading: sendPaymentLoading,
    sendPayment,
    hasAttemptedSend,
  } = useSendPayment(
    sendPaymentMutation,
    convertedDestination,
    settlementAmount,
    feeRateSatPerVbyte,
    note,
  )

  useEffect(() => {
    setWalletText()
    validateAmount()
  }, [usdWallet, btcWallet, fee])

  const setWalletText = () => {
    const btcBalanceMoneyAmount = toBtcMoneyAmount(btcWallet?.balance)
    const usdBalanceMoneyAmount = toUsdMoneyAmount(usdWallet?.balance)

    const btcWalletText = formatDisplayAndWalletAmount({
      displayAmount: convertMoneyAmount(btcBalanceMoneyAmount, DisplayCurrency),
      walletAmount: btcBalanceMoneyAmount,
    })
    const usdWalletText = formatDisplayAndWalletAmount({
      displayAmount: convertMoneyAmount(usdBalanceMoneyAmount, DisplayCurrency),
      walletAmount: usdBalanceMoneyAmount,
    })
    setBtcWalletText(btcWalletText)
    setUsdWalletText(usdWalletText)
  }

  const validateAmount = () => {
    const btcBalanceMoneyAmount = toBtcMoneyAmount(btcWallet?.balance)
    const usdBalanceMoneyAmount = toUsdMoneyAmount(usdWallet?.balance)

    if (
      moneyAmountIsCurrencyType(settlementAmount, WalletCurrency.Btc) &&
      btcBalanceMoneyAmount &&
      !isSendingMax
    ) {
      const totalAmount = addMoneyAmounts({
        a: settlementAmount,
        b: fee.amount || ZeroBtcMoneyAmount,
      })
      const validAmount = lessThanOrEqualTo({
        value: totalAmount,
        lessThanOrEqualTo: btcBalanceMoneyAmount,
      })
      if (!validAmount) {
        const invalidAmountErrorMessage = LL.SendBitcoinScreen.amountExceed({
          balance: btcWalletText,
        })
        setInvalidAmountErr(invalidAmountErrorMessage)
      }
      setIsValidAmount(validAmount)
    }

    if (
      moneyAmountIsCurrencyType(settlementAmount, WalletCurrency.Usd) &&
      usdBalanceMoneyAmount &&
      !isSendingMax
    ) {
      const totalAmount = addMoneyAmounts({
        a: settlementAmount,
        b: fee.amount || ZeroUsdMoneyAmount,
      })
      const validAmount = lessThanOrEqualTo({
        value: totalAmount,
        lessThanOrEqualTo: usdBalanceMoneyAmount,
      })
      if (!validAmount) {
        const invalidAmountErrorMessage = LL.SendBitcoinScreen.amountExceed({
          balance: usdWalletText,
        })
        setInvalidAmountErr(invalidAmountErrorMessage)
      }
      setIsValidAmount(validAmount)
    }
  }

  const handleSendPayment = useCallback(async () => {
    if (sendPayment && sendingWalletDescriptor?.currency) {
      console.log("Starting animation and sending payment")
      setIsAnimating(true) // Start the animation
      try {
        logPaymentAttempt({
          paymentType: paymentDetail.paymentType,
          sendingWallet: sendingWalletDescriptor.currency,
        })
        const { status, errorsMessage } = await sendPayment()
        logPaymentResult({
          paymentType: paymentDetail.paymentType,
          paymentStatus: status,
          sendingWallet: sendingWalletDescriptor.currency,
        })

        if (status === "SUCCESS" || status === "PENDING") {
          navigation.navigate("sendBitcoinSuccess")
          ReactNativeHapticFeedback.trigger("notificationSuccess", {
            ignoreAndroidSystemSettings: true,
          })
        } else if (status === "ALREADY_PAID") {
          setPaymentError("Invoice is already paid")
          ReactNativeHapticFeedback.trigger("notificationError", {
            ignoreAndroidSystemSettings: true,
          })
        } else {
          setPaymentError(errorsMessage || "Something went wrong")
          ReactNativeHapticFeedback.trigger("notificationError", {
            ignoreAndroidSystemSettings: true,
          })
        }
      } catch (err) {
        if (err instanceof Error) {
          crashlytics().recordError(err)
          setPaymentError(err.message || err.toString())
        }
      } finally {
        console.log("Stopping animation")
        setIsAnimating(false)
      }
    } else {
      return null
    }
  }, [paymentType, sendPayment, sendingWalletDescriptor?.currency])

  return (
    <Screen preset="scroll" style={styles.screenStyle} keyboardOffset="navigationHeader">
      <SendingAnimation isAnimating={isAnimating} />
      <View style={styles.sendBitcoinConfirmationContainer}>
        <ConfirmationDestinationAmountNote paymentDetail={paymentDetail} />
        <ConfirmationWalletFee
          flashUserAddress={flashUserAddress}
          paymentDetail={paymentDetail}
          btcWalletText={btcWalletText}
          usdWalletText={usdWalletText}
          feeRateSatPerVbyte={feeRateSatPerVbyte}
          fee={fee}
          setFee={setFee}
          setPaymentError={setPaymentError}
        />
        <ConfirmationError
          paymentError={paymentError}
          invalidAmountErrorMessage={invalidAmountErr}
        />
        <View style={styles.buttonContainer}>
          <GaloyPrimaryButton
            loading={sendPaymentLoading}
            title={LL.SendBitcoinConfirmationScreen.title()}
            disabled={!isValidAmount || hasAttemptedSend}
            onPress={handleSendPayment}
          />
        </View>
      </View>
    </Screen>
  )
}

export default SendBitcoinConfirmationScreen

const useStyles = makeStyles(({ colors }) => ({
  sendBitcoinConfirmationContainer: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  screenStyle: {
    padding: 20,
    flexGrow: 1,
  },
}))
