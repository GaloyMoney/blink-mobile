import DestinationIcon from "@app/assets/icons/destination.svg"
import NoteIcon from "@app/assets/icons/note.svg"
import { PaymentDestinationDisplay } from "@app/components/payment-destination-display"
import {
  PaymentSendResult,
  WalletCurrency,
  useIntraLedgerPaymentSendMutation,
  useIntraLedgerUsdPaymentSendMutation,
  useLnInvoicePaymentSendMutation,
  useLnNoAmountInvoicePaymentSendMutation,
  useLnNoAmountUsdInvoicePaymentSendMutation,
  useOnChainPaymentSendMutation,
  useSendBitcoinConfirmationScreenQuery,
  Maybe,
} from "@app/graphql/generated"
import { joinErrorsMessages } from "@app/graphql/utils"
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
import React, { useEffect, useState } from "react"
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native"
import { FakeCurrencyInput } from "react-native-currency-input"
import { testProps } from "../../../utils/testProps"
import { Status } from "./send-bitcoin.types"
import useFee from "./use-fee"
import { gql } from "@apollo/client"

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
      defaultAccount {
        btcWallet {
          balance
          usdBalance
        }
        usdWallet {
          balance
        }
      }
    }
  }

  mutation intraLedgerPaymentSend($input: IntraLedgerPaymentSendInput!) {
    intraLedgerPaymentSend(input: $input) {
      errors {
        message
      }
      status
    }
  }

  mutation intraLedgerUsdPaymentSend($input: IntraLedgerUsdPaymentSendInput!) {
    intraLedgerUsdPaymentSend(input: $input) {
      errors {
        message
      }
      status
    }
  }

  mutation lnNoAmountInvoicePaymentSend($input: LnNoAmountInvoicePaymentInput!) {
    lnNoAmountInvoicePaymentSend(input: $input) {
      errors {
        message
      }
      status
    }
  }

  mutation lnInvoicePaymentSend($input: LnInvoicePaymentInput!) {
    lnInvoicePaymentSend(input: $input) {
      errors {
        message
      }
      status
    }
  }

  mutation lnNoAmountUsdInvoicePaymentSend($input: LnNoAmountUsdInvoicePaymentInput!) {
    lnNoAmountUsdInvoicePaymentSend(input: $input) {
      errors {
        message
      }
      status
    }
  }

  mutation onChainPaymentSend($input: OnChainPaymentSendInput!) {
    onChainPaymentSend(input: $input) {
      errors {
        message
      }
      status
    }
  }
`

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
    note,
  } = route.params

  const { data } = useSendBitcoinConfirmationScreenQuery()
  const usdWalletBalance = data?.me?.defaultAccount?.usdWallet?.balance
  const btcWalletBalance = data?.me?.defaultAccount?.btcWallet?.balance
  const btcWalletValueInUsd = data?.me?.defaultAccount?.btcWallet?.usdBalance

  const isNoAmountInvoice = fixedAmount === undefined
  const [, setStatus] = useState<Status>(Status.IDLE)
  const [feeDisplayText, setFeeDisplayText] = useState<string>("")

  const paymentAmountInWalletCurrency =
    payerWalletDescriptor.currency === WalletCurrency.Btc
      ? paymentAmountInBtc
      : paymentAmountInUsd

  const [paymentError, setPaymentError] = useState<string | undefined>(undefined)

  const [intraLedgerPaymentSend, { loading: intraledgerLoading }] =
    useIntraLedgerPaymentSendMutation()
  const [intraLedgerUsdPaymentSend, { loading: intraLedgerUsdLoading }] =
    useIntraLedgerUsdPaymentSendMutation()
  const [lnInvoicePaymentSend, { loading: lnInvoiceLoading }] =
    useLnInvoicePaymentSendMutation()
  const [lnNoAmountInvoicePaymentSend, { loading: lnNoAmountInvoiceLoading }] =
    useLnNoAmountInvoicePaymentSendMutation()
  const [lnNoAmountUsdInvoicePaymentSend, { loading: lnNoAmountUsdLoading }] =
    useLnNoAmountUsdInvoicePaymentSendMutation()
  const [onChainPaymentSend, { loading: onChainLoading }] =
    useOnChainPaymentSendMutation()
  const { LL } = useI18nContext()
  const { formatToDisplayCurrency } = useDisplayCurrency()
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
    paymentAmount: paymentAmountInWalletCurrency,
  })

  useEffect(() => {
    if (fee.amount) {
      try {
        setFeeDisplayText(paymentAmountToTextWithUnits(fee.amount))
      } catch (error) {
        setFeeDisplayText("Unable to calculate fee")
        crashlytics().recordError(error)
      }
    }
  }, [fee])

  const payIntraLedger = async () => {
    const { data, errors } = await intraLedgerPaymentSend({
      variables: {
        input: {
          walletId: payerWalletDescriptor.id,
          recipientWalletId,
          amount: paymentAmountInWalletCurrency.amount,
          memo: note,
        },
      },
    })

    let errorsMessage = ""
    if (errors) {
      errorsMessage = joinErrorsMessages(errors)
    }

    if (data?.intraLedgerPaymentSend?.errors.length) {
      errorsMessage =
        errorsMessage + ` ${data?.intraLedgerPaymentSend?.errors[0].message}`
    }
    return { status: data?.intraLedgerPaymentSend.status, errorsMessage }
  }

  const payIntraLedgerUsd = async () => {
    const { data, errors } = await intraLedgerUsdPaymentSend({
      variables: {
        input: {
          walletId: payerWalletDescriptor.id,
          recipientWalletId,
          amount: paymentAmountInWalletCurrency.amount,
          memo: note,
        },
      },
    })

    let errorsMessage = ""
    if (errors) {
      errorsMessage = joinErrorsMessages(errors)
    }

    if (data?.intraLedgerUsdPaymentSend?.errors.length) {
      errorsMessage =
        errorsMessage + ` ${data?.intraLedgerUsdPaymentSend?.errors[0].message}`
    }
    return { status: data?.intraLedgerUsdPaymentSend.status, errorsMessage }
  }

  const payLnInvoice = async () => {
    const { data, errors } = await lnInvoicePaymentSend({
      variables: {
        input: {
          walletId: payerWalletDescriptor.id,
          paymentRequest: paymentType === "lnurl" ? lnurlInvoice : destination,
          memo: note,
        },
      },
    })

    let errorsMessage = ""
    if (errors) {
      errorsMessage = joinErrorsMessages(errors)
    }

    if (data?.lnInvoicePaymentSend?.errors.length) {
      errorsMessage = errorsMessage + ` ${data?.lnInvoicePaymentSend?.errors[0].message}`
    }
    return { status: data?.lnInvoicePaymentSend.status, errorsMessage }
  }

  const payLnNoAmountInvoice = async () => {
    const { data, errors } = await lnNoAmountInvoicePaymentSend({
      variables: {
        input: {
          walletId: payerWalletDescriptor.id,
          paymentRequest: destination,
          amount: paymentAmountInWalletCurrency.amount,
          memo: note,
        },
      },
    })

    let errorsMessage = ""
    if (errors) {
      errorsMessage = joinErrorsMessages(errors)
    }

    if (data?.lnNoAmountInvoicePaymentSend?.errors.length) {
      errorsMessage =
        errorsMessage + ` ${data?.lnNoAmountInvoicePaymentSend?.errors[0].message}`
    }
    return { status: data?.lnNoAmountInvoicePaymentSend.status, errorsMessage }
  }

  const payLnNoAmountUsdInvoice = async () => {
    const { data, errors } = await lnNoAmountUsdInvoicePaymentSend({
      variables: {
        input: {
          walletId: payerWalletDescriptor.id,
          paymentRequest: destination,
          amount: paymentAmountInWalletCurrency.amount,
          memo: note,
        },
      },
    })

    let errorsMessage = ""
    if (errors) {
      errorsMessage = joinErrorsMessages(errors)
    }

    if (data?.lnNoAmountUsdInvoicePaymentSend?.errors.length) {
      errorsMessage =
        errorsMessage + ` ${data?.lnNoAmountUsdInvoicePaymentSend?.errors[0]?.message}`
    }
    return { status: data?.lnNoAmountUsdInvoicePaymentSend.status, errorsMessage }
  }

  const payOnChain = async () => {
    const { data, errors } = await onChainPaymentSend({
      variables: {
        input: {
          walletId: payerWalletDescriptor.id,
          address: destination,
          amount: paymentAmountInWalletCurrency.amount,
          memo: note,
        },
      },
    })

    let errorsMessage = ""
    if (errors) {
      errorsMessage = joinErrorsMessages(errors)
    }

    if (data?.onChainPaymentSend?.errors.length) {
      errorsMessage = errorsMessage + ` ${data?.onChainPaymentSend?.errors[0].message}`
    }
    return { status: data?.onChainPaymentSend.status, errorsMessage }
  }

  const transactionPaymentMutation = (): (() => Promise<{
    status: Maybe<PaymentSendResult>
    errorsMessage: string
  }>) => {
    switch (paymentType) {
      case "intraledger":
        return payerWalletDescriptor.currency === WalletCurrency.Usd
          ? payIntraLedgerUsd
          : payIntraLedger
      case "lightning":
        if (isNoAmountInvoice) {
          return payerWalletDescriptor.currency === WalletCurrency.Usd
            ? payLnNoAmountUsdInvoice
            : payLnNoAmountInvoice
        }
        return payLnInvoice
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
      logPaymentAttempt({
        paymentType,
        sendingWallet: payerWalletDescriptor.currency,
      })
      const paymentMutation = transactionPaymentMutation()
      const { status, errorsMessage } = await paymentMutation()
      logPaymentResult({
        paymentType,
        paymentStatus: status,
        sendingWallet: payerWalletDescriptor.currency,
      })
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
      crashlytics().recordError(err)
      setStatus(Status.ERROR)
      setPaymentError(err.message || err.toString())
    }
  }

  let validAmount = false
  let invalidAmountErrorMessage = ""
  if (fee.amount && payerWalletDescriptor.currency === WalletCurrency.Btc) {
    validAmount = paymentAmountInBtc.amount + fee.amount.amount <= btcWalletBalance
    if (!validAmount) {
      invalidAmountErrorMessage = LL.SendBitcoinScreen.amountExceed({
        balance: satAmountDisplay(btcWalletBalance),
      })
    }
  }

  if (fee.amount && payerWalletDescriptor.currency === WalletCurrency.Usd) {
    validAmount = paymentAmountInUsd.amount + fee.amount.amount <= usdWalletBalance
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
            {payerWalletDescriptor.currency === WalletCurrency.Btc && (
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
                  minValue={0}
                  editable={false}
                  style={styles.convertedAmountText}
                />
              </>
            )}

            {payerWalletDescriptor.currency === WalletCurrency.Usd && (
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
        <Text style={styles.fieldTitleText}>{LL.common.from()}</Text>
        <View style={styles.fieldBackground}>
          <View style={styles.walletSelectorTypeContainer}>
            <View
              style={
                payerWalletDescriptor.currency === WalletCurrency.Btc
                  ? styles.walletSelectorTypeLabelBitcoin
                  : styles.walletSelectorTypeLabelUsd
              }
            >
              {payerWalletDescriptor.currency === WalletCurrency.Btc ? (
                <Text style={styles.walletSelectorTypeLabelBtcText}>BTC</Text>
              ) : (
                <Text style={styles.walletSelectorTypeLabelUsdText}>USD</Text>
              )}
            </View>
          </View>
          <View style={styles.walletSelectorInfoContainer}>
            <View style={styles.walletSelectorTypeTextContainer}>
              {payerWalletDescriptor.currency === WalletCurrency.Btc ? (
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
              {payerWalletDescriptor.currency === WalletCurrency.Btc ? (
                <>
                  <Text style={styles.walletBalanceText}>
                    {satAmountDisplay(btcWalletBalance)}
                    {" - "}
                    {formatToDisplayCurrency(btcWalletValueInUsd)}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.walletBalanceText}>
                    {formatToDisplayCurrency(usdWalletBalance / 100)}
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
            {fee.status === "set" && <Text>{feeDisplayText}</Text>}
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
            loading={isLoading}
            title={LL.SendBitcoinConfirmationScreen.title()}
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
