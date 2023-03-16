import { gql } from "@apollo/client"
import DestinationIcon from "@app/assets/icons/destination.svg"
import NoteIcon from "@app/assets/icons/note.svg"
import { PaymentDestinationDisplay } from "@app/components/payment-destination-display"
import { Screen } from "@app/components/screen"
import {
  useSendBitcoinConfirmationScreenQuery,
  WalletCurrency,
} from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { palette } from "@app/theme"
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
import { logPaymentAttempt, logPaymentResult } from "@app/utils/analytics"
import crashlytics from "@react-native-firebase/crashlytics"
import { CommonActions, RouteProp, useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { makeStyles } from "@rneui/themed"
import React, { useMemo, useState } from "react"
import { ActivityIndicator, Text, View } from "react-native"
import ReactNativeHapticFeedback from "react-native-haptic-feedback"
import { testProps } from "../../utils/testProps"
import useFee from "./use-fee"
import { useSendPayment } from "./use-send-payment"
import { AmountInput } from "@app/components/amount-input"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"

const useStyles = makeStyles((theme) => ({
  contentContainer: {
    padding: 20,
    flexGrow: 1,
    backgroundColor: theme.colors.lighterGreyOrBlack,
  },
  sendBitcoinConfirmationContainer: {
    flex: 1,
  },
  fieldContainer: {
    marginBottom: 12,
  },
  fieldBackground: {
    flexDirection: "row",
    borderStyle: "solid",
    overflow: "hidden",
    backgroundColor: palette.white,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
    height: 60,
  },
  fieldTitleText: {
    fontWeight: "bold",
    color: theme.colors.lapisLazuliOrLightGrey,
    marginBottom: 4,
  },
  destinationIconContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  destinationText: {
    flex: 1,
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
  amountContainer: {
    flex: 1,
    alignItems: "flex-start",
  },
  walletSelectorTypeContainer: {
    justifyContent: "center",
    alignItems: "flex-start",
    width: 50,
    marginRight: 20,
  },
  walletSelectorTypeLabelBitcoin: {
    height: 30,
    width: 50,
    borderRadius: 10,
    backgroundColor: palette.lightOrange,
    justifyContent: "center",
    alignItems: "center",
  },
  walletSelectorTypeLabelUsd: {
    height: 30,
    width: 50,
    backgroundColor: palette.usdSecondary,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  walletSelectorTypeLabelUsdText: {
    fontWeight: "bold",
    color: palette.usdPrimary,
  },
  walletSelectorTypeLabelBtcText: {
    fontWeight: "bold",
    color: palette.btcPrimary,
  },
  walletSelectorInfoContainer: {
    flex: 1,
    flexDirection: "column",
  },
  walletSelectorTypeTextContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  walletCurrencyText: {
    fontWeight: "bold",
    fontSize: 18,
    color: palette.lapisLazuli,
  },
  walletSelectorBalanceContainer: {
    flex: 1,
    flexDirection: "row",
  },
  walletBalanceText: {
    color: palette.midGrey,
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
  buttonContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  errorContainer: {
    marginTop: 20,
    flex: 1,
  },
  errorText: {
    color: palette.red,
    textAlign: "center",
  },
  warnText: {
    color: palette.coolGrey,
    textAlign: "center",
  },
  warnTextUnderlined: {
    color: palette.coolGrey,
    textDecorationLine: "underline",
  },
  maxFeeWarningText: {
    color: palette.midGrey,
    fontWeight: "bold",
  },
  disabledButtonStyle: {
    backgroundColor: palette.disabledButtonStyle,
  },
  disabledButtonTitleStyle: {
    color: palette.lightBlue,
    fontWeight: "600",
  },
  noteIconContainer: {
    marginRight: 12,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  noteIcon: {
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundColor: {
    backgroundColor: theme.colors.lighterGreyOrBlack,
  },
  screenStyle: {
    padding: 20,
    flexGrow: 1,
  },
}))

gql`
  query sendBitcoinConfirmationScreen {
    me {
      id
      defaultAccount {
        id
        btcWallet @client {
          balance
        }
        usdWallet @client {
          balance
        }
      }
    }
  }
`

type Props = { route: RouteProp<RootStackParamList, "sendBitcoinConfirmation"> }

const SendBitcoinConfirmationScreen: React.FC<Props> = ({ route }) => {
  const styles = useStyles()

  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "sendBitcoinConfirmation">>()

  const { paymentDetail } = route.params

  const {
    destination,
    paymentType,
    sendingWalletDescriptor,
    sendPayment: sendPaymentFn,
    getFee,
    settlementAmount,
    memo: note,
    unitOfAccountAmount,
    convertMoneyAmount,
  } = paymentDetail

  const { formatDisplayAndWalletAmount } = useDisplayCurrency()

  const { data } = useSendBitcoinConfirmationScreenQuery({ skip: !useIsAuthed() })

  const btcBalanceMoneyAmount = toBtcMoneyAmount(
    data?.me?.defaultAccount?.btcWallet?.balance,
  )

  const usdBalanceMoneyAmount = toUsdMoneyAmount(
    data?.me?.defaultAccount?.usdWallet?.balance,
  )

  const btcWalletText = formatDisplayAndWalletAmount({
    displayAmount: convertMoneyAmount(btcBalanceMoneyAmount, DisplayCurrency),
    walletAmount: btcBalanceMoneyAmount,
  })

  const usdWalletText = formatDisplayAndWalletAmount({
    displayAmount: convertMoneyAmount(usdBalanceMoneyAmount, DisplayCurrency),
    walletAmount: usdBalanceMoneyAmount,
  })

  const [paymentError, setPaymentError] = useState<string | undefined>(undefined)
  const { LL } = useI18nContext()

  const fee = useFee(getFee)

  const sendingMax =
    paymentType === "onchain" && settlementAmount.currency === WalletCurrency.Usd
      ? settlementAmount.amount >= usdBalanceMoneyAmount.amount
      : settlementAmount.amount >= btcBalanceMoneyAmount.amount

  const { loading: sendPaymentLoading, sendPayment } = useSendPayment(sendPaymentFn)
  let feeDisplayText = ""
  if (fee.amount) {
    const feeDisplayAmount = paymentDetail.convertMoneyAmount(fee.amount, DisplayCurrency)
    feeDisplayText = formatDisplayAndWalletAmount({
      displayAmount: feeDisplayAmount,
      walletAmount: fee.amount,
    })
  } else {
    // TODO hard coded text and this error is a bit missmatched alter on
    feeDisplayText = "Unable to calculate fee"
  }

  const handleSendPayment = useMemo(() => {
    if (!sendPayment || !sendingWalletDescriptor?.currency) {
      return sendPayment
    }

    return async () => {
      try {
        logPaymentAttempt({
          paymentType: paymentDetail.paymentType,
          sendingWallet: sendingWalletDescriptor.currency,
        })
        // TODO: handle maxAmount
        const { status, errorsMessage } = await sendPayment()
        logPaymentResult({
          paymentType: paymentDetail.paymentType,
          paymentStatus: status,
          sendingWallet: sendingWalletDescriptor.currency,
        })

        if (!errorsMessage && status === "SUCCESS") {
          navigation.dispatch((state) => {
            const routes = [{ name: "Primary" }, { name: "sendBitcoinSuccess" }]
            return CommonActions.reset({
              ...state,
              routes,
              index: routes.length - 1,
            })
          })
          ReactNativeHapticFeedback.trigger("notificationSuccess", {
            ignoreAndroidSystemSettings: true,
          })
          return
        }

        if (status === "ALREADY_PAID") {
          setPaymentError("Invoice is already paid")
          ReactNativeHapticFeedback.trigger("notificationError", {
            ignoreAndroidSystemSettings: true,
          })
          return
        }

        setPaymentError(errorsMessage || "Something went wrong")
        ReactNativeHapticFeedback.trigger("notificationError", {
          ignoreAndroidSystemSettings: true,
        })
      } catch (err) {
        if (err instanceof Error) {
          crashlytics().recordError(err)
          setPaymentError(err.message || err.toString())
        }
      }
    }
  }, [
    navigation,
    paymentDetail.paymentType,
    sendPayment,
    setPaymentError,
    sendingWalletDescriptor?.currency,
  ])

  let validAmount = true
  let invalidAmountErrorMessage = ""

  if (
    moneyAmountIsCurrencyType(settlementAmount, WalletCurrency.Btc) &&
    btcBalanceMoneyAmount
  ) {
    const totalAmount = addMoneyAmounts({
      a: settlementAmount,
      b: fee.amount || ZeroBtcMoneyAmount,
    })
    validAmount =
      sendingMax ||
      lessThanOrEqualTo({
        value: totalAmount,
        lessThanOrEqualTo: btcBalanceMoneyAmount,
      })
    if (!validAmount) {
      invalidAmountErrorMessage = LL.SendBitcoinScreen.amountExceed({
        balance: btcWalletText,
      })
    }
  }

  if (
    moneyAmountIsCurrencyType(settlementAmount, WalletCurrency.Usd) &&
    usdBalanceMoneyAmount
  ) {
    const totalAmount = addMoneyAmounts({
      a: settlementAmount,
      b: fee.amount || ZeroUsdMoneyAmount,
    })
    validAmount =
      sendingMax ||
      lessThanOrEqualTo({
        value: totalAmount,
        lessThanOrEqualTo: usdBalanceMoneyAmount,
      })
    if (!validAmount) {
      invalidAmountErrorMessage = LL.SendBitcoinScreen.amountExceed({
        balance: usdWalletText,
      })
    }
  }

  const errorMessage = paymentError || invalidAmountErrorMessage

  return (
    <Screen
      preset="scroll"
      backgroundColor={styles.backgroundColor.backgroundColor}
      style={styles.screenStyle}
      keyboardOffset="navigationHeader"
    >
      <View style={styles.sendBitcoinConfirmationContainer}>
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldTitleText}>{LL.SendBitcoinScreen.destination()}</Text>
          <View style={styles.fieldBackground}>
            <View style={styles.destinationIconContainer}>
              <DestinationIcon />
            </View>
            <View style={styles.destinationText}>
              <PaymentDestinationDisplay
                destination={destination}
                paymentType={paymentType}
              />
            </View>
          </View>
        </View>
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldTitleText}>{LL.SendBitcoinScreen.amount()}</Text>
          <AmountInput
            unitOfAccountAmount={unitOfAccountAmount}
            canSetAmount={false}
            convertMoneyAmount={convertMoneyAmount}
            walletCurrency={sendingWalletDescriptor.currency}
          />
        </View>
        {note ? (
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldTitleText}>{LL.SendBitcoinScreen.note()}</Text>
            <View style={styles.fieldBackground}>
              <View style={styles.noteIconContainer}>
                <NoteIcon style={styles.noteIcon} />
              </View>
              <Text>{note}</Text>
            </View>
          </View>
        ) : null}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldTitleText}>{LL.common.from()}</Text>
          <View style={styles.fieldBackground}>
            <View style={styles.walletSelectorTypeContainer}>
              <View
                style={
                  sendingWalletDescriptor.currency === WalletCurrency.Btc
                    ? styles.walletSelectorTypeLabelBitcoin
                    : styles.walletSelectorTypeLabelUsd
                }
              >
                {sendingWalletDescriptor.currency === WalletCurrency.Btc ? (
                  <Text style={styles.walletSelectorTypeLabelBtcText}>BTC</Text>
                ) : (
                  <Text style={styles.walletSelectorTypeLabelUsdText}>USD</Text>
                )}
              </View>
            </View>
            <View style={styles.walletSelectorInfoContainer}>
              <View style={styles.walletSelectorTypeTextContainer}>
                {sendingWalletDescriptor.currency === WalletCurrency.Btc ? (
                  <Text style={styles.walletCurrencyText}>{LL.common.btcAccount()}</Text>
                ) : (
                  <Text style={styles.walletCurrencyText}>{LL.common.usdAccount()}</Text>
                )}
              </View>
              <View style={styles.walletSelectorBalanceContainer}>
                {sendingWalletDescriptor.currency === WalletCurrency.Btc ? (
                  <Text style={styles.walletBalanceText}>{btcWalletText}</Text>
                ) : (
                  <Text style={styles.walletBalanceText}>{usdWalletText}</Text>
                )}
              </View>
              <View />
            </View>
          </View>
        </View>
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldTitleText}>
            {LL.SendBitcoinConfirmationScreen.feeLabel()}
          </Text>
          <View style={styles.fieldBackground}>
            <View style={styles.destinationText}>
              {fee.status === "loading" && <ActivityIndicator />}
              {fee.status === "set" && (
                <Text {...testProps("Successful Fee")}>{feeDisplayText}</Text>
              )}
              {fee.status === "error" && Boolean(fee.amount) && (
                <Text>{feeDisplayText} *</Text>
              )}
              {fee.status === "error" && !fee.amount && (
                <Text>{LL.SendBitcoinConfirmationScreen.feeError()}</Text>
              )}
            </View>
          </View>
          {fee.status === "error" && Boolean(fee.amount) && (
            <Text style={styles.maxFeeWarningText}>
              {"*" + LL.SendBitcoinConfirmationScreen.maxFeeSelected()}
            </Text>
          )}
        </View>

        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}
        <View style={styles.buttonContainer}>
          <GaloyPrimaryButton
            {...testProps(LL.SendBitcoinConfirmationScreen.title())}
            loading={sendPaymentLoading}
            title={LL.SendBitcoinConfirmationScreen.title()}
            disabled={!handleSendPayment || !validAmount}
            onPress={handleSendPayment || undefined}
          />
        </View>
      </View>
    </Screen>
  )
}

export default SendBitcoinConfirmationScreen
