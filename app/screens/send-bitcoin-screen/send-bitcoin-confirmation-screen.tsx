import DestinationIcon from "@app/assets/icons/destination.svg"
import React, { useState } from "react"
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native"
import { palette } from "@app/theme"
import { WalletCurrency } from "@app/types/amounts"
import { GaloyGQL, translateUnknown as translate, useMutation } from "@galoymoney/client"
import { Status } from "./send-bitcoin.types"
import { StackScreenProps } from "@react-navigation/stack"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { useWalletBalance } from "@app/hooks"
import useFee from "./use-fee"
import {
  paymentAmountToDollarsOrSats,
  paymentAmountToTextWithUnits,
  satAmountDisplay,
  usdAmountDisplay,
} from "@app/utils/currencyConversion"
import { PaymentDestinationDisplay } from "@app/components/payment-destination-display"
import { FakeCurrencyInput } from "react-native-currency-input"
import { Button } from "react-native-elements"
import NoteIcon from "@app/assets/icons/note.svg"
import { CommonActions } from "@react-navigation/native"

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

const SendBitcoinConfirmationScreen = ({
  navigation,
  route,
}: StackScreenProps<RootStackParamList, "sendBitcoinConfirmation">) => {
  const {
    paymentType,
    destination,
    fixedAmount,
    paymentAmountInBtc,
    paymentAmountInUsd,
    recipientWalletId,
    lnurlInvoice,
    payerWalletDescriptor,
    sameNode,
    note,
  } = route.params

  const isNoAmountInvoice = fixedAmount === undefined
  const [, setStatus] = useState<Status>(Status.IDLE)

  const paymentAmountInWalletCurrency =
    payerWalletDescriptor.currency === WalletCurrency.BTC
      ? paymentAmountInBtc
      : paymentAmountInUsd

  const { usdWalletBalance, btcWalletBalance, btcWalletValueInUsd } = useWalletBalance()
  const [paymentError, setPaymentError] = useState<string | undefined>(undefined)

  const [intraLedgerPaymentSend, { loading: intraledgerLoading }] =
    useMutation.intraLedgerPaymentSend()
  const [intraLedgerUsdPaymentSend, { loading: intraLedgerUsdLoading }] =
    useMutation.intraLedgerUsdPaymentSend()
  const [lnInvoicePaymentSend, { loading: lnInvoiceLoading }] =
    useMutation.lnInvoicePaymentSend()
  const [lnNoAmountInvoicePaymentSend, { loading: lnNoAmountInvoiceLoading }] =
    useMutation.lnNoAmountInvoicePaymentSend()
  const [lnNoAmountUsdInvoicePaymentSend, { loading: lnNoAmountUsdLoading }] =
    useMutation.lnNoAmountUsdInvoicePaymentSend()
  const [onChainPaymentSend, { loading: onChainLoading }] =
    useMutation.onChainPaymentSend()

  const isLoading =
    intraledgerLoading ||
    intraLedgerUsdLoading ||
    lnInvoiceLoading ||
    lnNoAmountInvoiceLoading ||
    lnNoAmountUsdLoading ||
    onChainLoading

  const fee = useFee({
    walletDescriptor: payerWalletDescriptor,
    address: paymentType === "lnurl" ? lnurlInvoice : destination,
    isNoAmountInvoice,
    invoice: paymentType === "lnurl" ? lnurlInvoice : destination,
    paymentType,
    sameNode,
    paymentAmount: paymentAmountInWalletCurrency,
  })

  const feeDisplayText = fee.amount && paymentAmountToTextWithUnits(fee.amount)

  const payIntraLedger = async () => {
    const { data, errorsMessage } = await intraLedgerPaymentSend({
      variables: {
        input: {
          walletId: payerWalletDescriptor.id,
          recipientWalletId,
          amount: paymentAmountInWalletCurrency.amount,
          memo: note,
        },
      },
    })
    return { status: data.intraLedgerPaymentSend.status, errorsMessage }
  }

  const payIntraLedgerUsd = async () => {
    const { data, errorsMessage } = await intraLedgerUsdPaymentSend({
      variables: {
        input: {
          walletId: payerWalletDescriptor.id,
          recipientWalletId,
          amount: paymentAmountInWalletCurrency.amount,
          memo: note,
        },
      },
    })
    return { status: data.intraLedgerUsdPaymentSend.status, errorsMessage }
  }

  const payLnInvoice = async () => {
    const { data, errorsMessage } = await lnInvoicePaymentSend({
      variables: {
        input: {
          walletId: payerWalletDescriptor.id,
          paymentRequest: paymentType === "lnurl" ? lnurlInvoice : destination,
          memo: note,
        },
      },
    })

    return { status: data.lnInvoicePaymentSend.status, errorsMessage }
  }

  const payLnNoAmountInvoice = async () => {
    const { data, errorsMessage } = await lnNoAmountInvoicePaymentSend({
      variables: {
        input: {
          walletId: payerWalletDescriptor.id,
          paymentRequest: destination,
          amount: paymentAmountInWalletCurrency.amount,
          memo: note,
        },
      },
    })

    return { status: data.lnNoAmountInvoicePaymentSend.status, errorsMessage }
  }

  const payLnNoAmountUsdInvoice = async () => {
    const { data, errorsMessage } = await lnNoAmountUsdInvoicePaymentSend({
      variables: {
        input: {
          walletId: payerWalletDescriptor.id,
          paymentRequest: destination,
          amount: paymentAmountInWalletCurrency.amount,
          memo: note,
        },
      },
    })
    return { status: data.lnNoAmountUsdInvoicePaymentSend.status, errorsMessage }
  }

  const payOnChain = async () => {
    const { data, errorsMessage } = await onChainPaymentSend({
      variables: {
        input: {
          walletId: payerWalletDescriptor.id,
          address: destination,
          amount: paymentAmountInWalletCurrency.amount,
          memo: note,
        },
      },
    })

    return { status: data.onChainPaymentSend.status, errorsMessage }
  }

  const transactionPaymentMutation = (): (() => Promise<{
    status: GaloyGQL.PaymentSendResult
    errorsMessage: string
  }>) => {
    switch (paymentType) {
      case "intraledger":
        return payerWalletDescriptor.currency === WalletCurrency.USD
          ? payIntraLedgerUsd
          : payIntraLedger
      case "lightning":
        if (!isNoAmountInvoice) {
          return payLnInvoice
        }
        return payerWalletDescriptor.currency === WalletCurrency.USD
          ? payLnNoAmountUsdInvoice
          : payLnNoAmountInvoice
      case "onchain":
        return payOnChain
      case "lnurl":
        return payLnInvoice
      default:
        throw new Error("Unsupported payment type")
    }
  }

  const sendPayment = async () => {
    setStatus(Status.LOADING)
    try {
      const paymentMutation = transactionPaymentMutation()
      const { status, errorsMessage } = await paymentMutation()

      if (!errorsMessage && status === "SUCCESS") {
        setStatus(Status.SUCCESS)
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
      setStatus(Status.ERROR)
      setPaymentError(err.message || err.toString())
    }
  }

  let validAmount = false
  let invalidAmountErrorMessage = ""
  if (fee.amount && payerWalletDescriptor.currency === WalletCurrency.BTC) {
    validAmount = paymentAmountInBtc.amount + fee.amount.amount <= btcWalletBalance
    if (!validAmount) {
      invalidAmountErrorMessage = translate("SendBitcoinScreen.amountExceed", {
        balance: satAmountDisplay(btcWalletBalance),
      })
    }
  }

  if (fee.amount && payerWalletDescriptor.currency === WalletCurrency.USD) {
    validAmount = paymentAmountInUsd.amount + fee.amount.amount <= usdWalletBalance
    if (!validAmount) {
      invalidAmountErrorMessage = translate("SendBitcoinScreen.amountExceed", {
        balance: usdAmountDisplay(usdWalletBalance / 100),
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
        <Text style={styles.fieldTitleText}>
          {translate("SendBitcoinScreen.destination")}
        </Text>
        <View style={styles.fieldBackground}>
          <View style={styles.destinationIconContainer}>
            <DestinationIcon />
          </View>
          <View style={styles.destinationText}>
            <PaymentDestinationDisplay destination={destination} />
          </View>
        </View>

        <Text style={styles.fieldTitleText}>{translate("SendBitcoinScreen.amount")}</Text>
        <View style={styles.fieldBackground}>
          <View style={styles.amountContainer}>
            {payerWalletDescriptor.currency === WalletCurrency.BTC && (
              <>
                <FakeCurrencyInput
                  value={paymentAmountToDollarsOrSats(paymentAmountInBtc)}
                  prefix=""
                  delimiter=","
                  separator="."
                  precision={0}
                  suffix=" sats"
                  minValue={0}
                  editable={false}
                  style={styles.walletBalanceInput}
                />
                <FakeCurrencyInput
                  value={paymentAmountToDollarsOrSats(paymentAmountInUsd)}
                  prefix="$"
                  delimiter=","
                  separator="."
                  precision={2}
                  editable={false}
                  style={styles.convertedAmountText}
                />
              </>
            )}

            {payerWalletDescriptor.currency === WalletCurrency.USD && (
              <FakeCurrencyInput
                value={paymentAmountToDollarsOrSats(paymentAmountInUsd)}
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
        <Text style={styles.fieldTitleText}>{translate("common.from")}</Text>
        <View style={styles.fieldBackground}>
          <View style={styles.walletSelectorTypeContainer}>
            <View
              style={
                payerWalletDescriptor.currency === WalletCurrency.BTC
                  ? styles.walletSelectorTypeLabelBitcoin
                  : styles.walletSelectorTypeLabelUsd
              }
            >
              {payerWalletDescriptor.currency === WalletCurrency.BTC ? (
                <Text style={styles.walletSelectorTypeLabelBtcText}>BTC</Text>
              ) : (
                <Text style={styles.walletSelectorTypeLabelUsdText}>USD</Text>
              )}
            </View>
          </View>
          <View style={styles.walletSelectorInfoContainer}>
            <View style={styles.walletSelectorTypeTextContainer}>
              {payerWalletDescriptor.currency === WalletCurrency.BTC ? (
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
              {payerWalletDescriptor.currency === WalletCurrency.BTC ? (
                <>
                  <Text style={styles.walletBalanceText}>
                    {satAmountDisplay(btcWalletBalance)}
                    {" - "}
                    {usdAmountDisplay(btcWalletValueInUsd)}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.walletBalanceText}>
                    {usdAmountDisplay(usdWalletBalance / 100)}
                  </Text>
                </>
              )}
            </View>
            <View />
          </View>
        </View>
        {note ? (
          <>
            <Text style={styles.fieldTitleText}>
              {translate("SendBitcoinScreen.note")}
            </Text>
            <View style={styles.fieldBackground}>
              <View style={styles.noteIconContainer}>
                <NoteIcon style={styles.noteIcon} />
              </View>
              <Text>{note}</Text>
            </View>
          </>
        ) : null}
        <Text style={styles.fieldTitleText}>
          {translate("SendBitcoinConfirmationScreen.feeLabel")}
        </Text>
        <View style={styles.fieldBackground}>
          <View style={styles.destinationText}>
            {fee.status === "loading" && <ActivityIndicator />}
            {fee.status === "set" && <Text>{feeDisplayText}</Text>}
            {fee.status === "error" && Boolean(feeDisplayText) && (
              <Text>{feeDisplayText} *</Text>
            )}
          </View>
        </View>
        {fee.status === "error" && Boolean(feeDisplayText) && (
          <Text style={styles.maxFeeWarningText}>
            {"*" + translate("SendBitcoinConfirmationScreen.maxFeeSelected")}
          </Text>
        )}

        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}
        <View style={styles.buttonContainer}>
          <Button
            loading={isLoading}
            title={translate("SendBitcoinConfirmationScreen.title")}
            buttonStyle={styles.button}
            titleStyle={styles.buttonTitleStyle}
            disabledStyle={[styles.button, styles.disabledButtonStyle]}
            disabledTitleStyle={styles.disabledButtonTitleStyle}
            disabled={fee.status === "loading" || isLoading || !validAmount}
            onPress={sendPayment}
          />
        </View>
      </View>
    </ScrollView>
  )
}

export default SendBitcoinConfirmationScreen
