import DestinationIcon from "@app/assets/icons/destination.svg"
import NoteIcon from "@app/assets/icons/note.svg"
import { PaymentDestinationDisplay } from "@app/components/payment-destination-display"
import {
  WalletCurrency,
  useSendBitcoinConfirmationScreenQuery,
} from "@app/graphql/generated"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { palette } from "@app/theme"
import { logPaymentAttempt, logPaymentResult } from "@app/utils/analytics"
import {
  paymentAmountToDollarsOrSats,
  paymentAmountToTextWithUnits,
  satAmountDisplay,
} from "@app/utils/currencyConversion"
import crashlytics from "@react-native-firebase/crashlytics"
import { CommonActions } from "@react-navigation/native"
import { StackScreenProps } from "@react-navigation/stack"
import { Button } from "@rneui/base"
import React, { useMemo, useState } from "react"
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native"
import { FakeCurrencyInput } from "react-native-currency-input"
import { testProps } from "../../utils/testProps"
import useFee from "./use-fee"
import { gql } from "@apollo/client"
import { useSendPayment } from "./use-send-payment"
import { useIsAuthed } from "@app/graphql/is-authed-context"

const styles = StyleSheet.create({
  scrollView: {
    flexDirection: "column",
    padding: 20,
    flex: 6,
  },
  contentContainer: {
    flexGrow: 1,
  },
  sendBitcoinConfirmationContainer: {
    flex: 1,
  },
  fieldBackground: {
    flexDirection: "row",
    borderStyle: "solid",
    overflow: "hidden",
    backgroundColor: palette.white,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderRadius: 10,
    alignItems: "center",
    height: 60,
  },
  fieldTitleText: {
    fontWeight: "bold",
    color: palette.lapisLazuli,
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
    backgroundColor: "rgba(241, 164, 60, 0.5)",
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
  walletTypeText: {
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
    marginBottom: 50,
  },
  errorContainer: {
    marginVertical: 20,
    flex: 1,
  },
  errorText: {
    color: palette.red,
    textAlign: "center",
  },
  maxFeeWarningText: {
    color: palette.midGrey,
    fontWeight: "bold",
  },
  disabledButtonStyle: {
    backgroundColor: "rgba(83, 111, 242, 0.1)",
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
})

gql`
  query sendBitcoinConfirmationScreen {
    me {
      id
      defaultAccount {
        id
        btcWallet @client {
          balance
          usdBalance
        }
        usdWallet @client {
          balance
        }
      }
    }
  }
`

const SendBitcoinConfirmationScreen = ({
  navigation,
  route,
}: StackScreenProps<RootStackParamList, "sendBitcoinConfirmation">) => {
  const { paymentDetail } = route.params

  const {
    destination,
    paymentType,
    sendingWalletDescriptor,
    sendPayment: sendPaymentFn,
    getFee: getFeeFn,
    settlementAmount,
    memo: note,
    unitOfAccountAmount,
  } = paymentDetail

  const { data } = useSendBitcoinConfirmationScreenQuery({ skip: !useIsAuthed() })
  const usdWalletBalance = data?.me?.defaultAccount?.usdWallet?.balance
  const btcWalletBalance = data?.me?.defaultAccount?.btcWallet?.balance
  const btcWalletValueInUsd = data?.me?.defaultAccount?.btcWallet?.usdBalance

  const [paymentError, setPaymentError] = useState<string | undefined>(undefined)
  const { LL } = useI18nContext()
  const { formatToDisplayCurrency } = useDisplayCurrency()

  const fee = useFee(getFeeFn)

  const { loading: sendPaymentLoading, sendPayment } = useSendPayment(sendPaymentFn)
  const feeDisplayText = fee.amount
    ? paymentAmountToTextWithUnits(fee.amount)
    : "Unable to calculate fee"

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
          return
        }

        if (status === "ALREADY_PAID") {
          setPaymentError("Invoice is already paid")
          return
        }

        setPaymentError(errorsMessage || "Something went wrong")
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

  if (!sendingWalletDescriptor || !settlementAmount || !unitOfAccountAmount) {
    return <></>
  }

  if (
    fee.amount &&
    sendingWalletDescriptor.currency === WalletCurrency.Btc &&
    btcWalletBalance
  ) {
    validAmount = settlementAmount.amount + fee.amount.amount <= btcWalletBalance
    if (!validAmount) {
      invalidAmountErrorMessage = LL.SendBitcoinScreen.amountExceed({
        balance: satAmountDisplay(btcWalletBalance),
      })
    }
  }

  if (
    fee.amount &&
    sendingWalletDescriptor.currency === WalletCurrency.Usd &&
    usdWalletBalance
  ) {
    validAmount = settlementAmount.amount + fee.amount.amount <= usdWalletBalance
    if (!validAmount) {
      invalidAmountErrorMessage = LL.SendBitcoinScreen.amountExceed({
        balance: formatToDisplayCurrency(usdWalletBalance / 100),
      })
    }
  }

  const errorMessage = paymentError || invalidAmountErrorMessage

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.sendBitcoinConfirmationContainer}>
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

        <Text style={styles.fieldTitleText}>{LL.SendBitcoinScreen.amount()}</Text>
        <View style={styles.fieldBackground}>
          <View style={styles.amountContainer}>
            {sendingWalletDescriptor.currency === WalletCurrency.Btc && (
              <>
                <FakeCurrencyInput
                  value={paymentAmountToDollarsOrSats(settlementAmount)}
                  prefix=""
                  delimiter=","
                  separator="."
                  precision={0}
                  suffix=" sats"
                  minValue={0}
                  editable={false}
                  style={styles.walletBalanceInput}
                />
                {unitOfAccountAmount.currency === WalletCurrency.Usd ? (
                  <FakeCurrencyInput
                    value={paymentAmountToDollarsOrSats(unitOfAccountAmount)}
                    prefix="$"
                    delimiter=","
                    separator="."
                    precision={2}
                    minValue={0}
                    editable={false}
                    style={styles.convertedAmountText}
                  />
                ) : (
                  <></>
                )}
              </>
            )}

            {sendingWalletDescriptor.currency === WalletCurrency.Usd && (
              <FakeCurrencyInput
                value={paymentAmountToDollarsOrSats(settlementAmount)}
                prefix="$"
                delimiter=","
                separator="."
                precision={2}
                minValue={0}
                style={styles.walletBalanceInput}
                editable={false}
              />
            )}
          </View>
        </View>
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
                <>
                  <Text style={styles.walletTypeText}>Bitcoin Wallet</Text>
                </>
              ) : (
                <>
                  <Text style={styles.walletTypeText}>US Dollar Wallet</Text>
                </>
              )}
            </View>
            <View style={styles.walletSelectorBalanceContainer}>
              {sendingWalletDescriptor.currency === WalletCurrency.Btc ? (
                <>
                  <Text style={styles.walletBalanceText}>
                    {typeof btcWalletBalance === "number" &&
                    typeof btcWalletValueInUsd === "number"
                      ? `${satAmountDisplay(
                          btcWalletBalance,
                        )} - ${formatToDisplayCurrency(btcWalletValueInUsd)}`
                      : ""}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.walletBalanceText}>
                    {typeof usdWalletBalance === "number"
                      ? formatToDisplayCurrency(usdWalletBalance / 100)
                      : ""}
                  </Text>
                </>
              )}
            </View>
            <View />
          </View>
        </View>
        {note ? (
          <>
            <Text style={styles.fieldTitleText}>{LL.SendBitcoinScreen.note()}</Text>
            <View style={styles.fieldBackground}>
              <View style={styles.noteIconContainer}>
                <NoteIcon style={styles.noteIcon} />
              </View>
              <Text>{note}</Text>
            </View>
          </>
        ) : null}
        <Text style={styles.fieldTitleText}>
          {LL.SendBitcoinConfirmationScreen.feeLabel()}
        </Text>
        <View style={styles.fieldBackground}>
          <View style={styles.destinationText}>
            {fee.status === "loading" && <ActivityIndicator />}
            {fee.status === "set" && (
              <Text {...testProps("Successful Fee")}>{feeDisplayText}</Text>
            )}
            {fee.status === "error" && Boolean(feeDisplayText) && (
              <Text>{feeDisplayText} *</Text>
            )}
            {fee.status === "error" && !feeDisplayText && (
              <Text>{LL.SendBitcoinConfirmationScreen.feeError()}</Text>
            )}
          </View>
        </View>
        {fee.status === "error" && Boolean(feeDisplayText) && (
          <Text style={styles.maxFeeWarningText}>
            {"*" + LL.SendBitcoinConfirmationScreen.maxFeeSelected()}
          </Text>
        )}

        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}
        <View style={styles.buttonContainer}>
          <Button
            {...testProps(LL.SendBitcoinConfirmationScreen.title())}
            loading={sendPaymentLoading}
            title={LL.SendBitcoinConfirmationScreen.title()}
            buttonStyle={styles.button}
            titleStyle={styles.buttonTitleStyle}
            disabledStyle={[styles.button, styles.disabledButtonStyle]}
            disabledTitleStyle={styles.disabledButtonTitleStyle}
            disabled={!handleSendPayment || !validAmount}
            onPress={handleSendPayment || undefined}
          />
        </View>
      </View>
    </ScrollView>
  )
}

export default SendBitcoinConfirmationScreen
