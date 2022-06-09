import {
  GaloyGQL,
  PaymentType,
  translateUnknown as translate,
  useMutation,
} from "@galoymoney/client"
import { palette } from "@app/theme"
import React, { Dispatch, SetStateAction, useEffect, useState } from "react"
import { ActivityIndicator, StyleSheet, Text, View } from "react-native"
import DestinationIcon from "@app/assets/icons/destination.svg"
import { FakeCurrencyInput } from "react-native-currency-input"
import { useMySubscription, useWalletBalance } from "@app/hooks"
import { Button } from "react-native-elements"
import FeeIcon from "@app/assets/icons/fee.svg"
import useFee from "./use-fee"
import {
  paymentAmountToDollarsOrSats,
  paymentAmountToTextWithUnits,
  satAmountDisplay,
  usdAmountDisplay,
} from "@app/utils/currencyConversion"
import { PaymentAmount, WalletCurrency } from "@app/types/amounts"
import { PaymentDestinationDisplay } from "@app/components/payment-destination-display"
import { Status } from "./send-bitcoin.types"

const styles = StyleSheet.create({
  sendBitcoinConfirmationContainer: {
    flex: 1,
    flexDirection: "column",
  },
  fieldBackground: {
    flexDirection: "row",
    borderStyle: "solid",
    overflow: "hidden",
    backgroundColor: palette.white,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    height: 60,
  },
  fieldTitleText: {
    fontWeight: "bold",
    color: palette.lapisLazuli,
    marginTop: 8,
    marginBottom: 4,
  },

  destinationIconContainer: {
    width: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  destinationText: {
    flex: 1,
  },
  walletBalanceInput: {
    color: palette.lapisLazuli,
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 20,
  },
  convertedAmountText: {
    color: palette.coolGrey,
    fontSize: 12,
    marginLeft: 20,
  },
  amountContainer: {
    flex: 1,
    alignItems: "flex-start",
  },
  walletSelectorTypeContainer: {
    justifyContent: "center",
    alignItems: "flex-start",
    width: 50,
    margin: 20,
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
  disabledButtonStyle: {
    backgroundColor: "rgba(83, 111, 242, 0.1)",
  },
  disabledButtonTitleStyle: {
    color: palette.lightBlue,
    fontWeight: "600",
  },
})

type SendBitcoinConfirmationProps = {
  destination: string
  recipientWalletId?: string
  wallet: any
  paymentAmount: PaymentAmount<WalletCurrency>
  note?: string
  setStatus: Dispatch<SetStateAction<Status>>
  isNoAmountInvoice: boolean
  paymentType: PaymentType
  sameNode: boolean
}

const SendBitcoinConfirmation = ({
  destination,
  recipientWalletId,
  wallet,
  paymentAmount,
  note,
  isNoAmountInvoice,
  paymentType,
  sameNode,
  setStatus,
}: SendBitcoinConfirmationProps) => {
  const { convertCurrencyAmount, convertPaymentAmount } = useMySubscription()
  const [secondaryAmount, setSecondaryAmount] = useState<number | undefined>(undefined)
  const { usdWalletBalance, btcWalletBalance, btcWalletValueInUsd } = useWalletBalance()
  const [error, setError] = useState<string | undefined>(undefined)

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
  const paymentAmountInWalletCurrency = convertPaymentAmount(
    paymentAmount,
    wallet.walletCurrency as WalletCurrency,
  )
  const isLoading =
    intraledgerLoading ||
    intraLedgerUsdLoading ||
    lnInvoiceLoading ||
    lnNoAmountInvoiceLoading ||
    lnNoAmountUsdLoading ||
    onChainLoading

  const fee = useFee({
    walletDescriptor: {
      id: wallet.id,
      currency: wallet.walletCurrency,
    },
    address: destination,
    isNoAmountInvoice,
    invoice: destination,
    paymentType,
    sameNode,
    paymentAmount: paymentAmountInWalletCurrency,
  })

  const feeDisplayText = fee.amount && paymentAmountToTextWithUnits(fee.amount)

  const payIntraLedger = async () => {
    const { data, errorsMessage } = await intraLedgerPaymentSend({
      variables: {
        input: {
          walletId: wallet.id,
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
          walletId: wallet.id,
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
          walletId: wallet.id,
          paymentRequest: destination,
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
          walletId: wallet.id,
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
          walletId: wallet.id,
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
          walletId: wallet.id,
          address: destination,
          amount: paymentAmountInWalletCurrency.amount,
          memo: note,
        },
      },
    })

    return { status: data.onChainPaymentSend.status, errorsMessage }
  }

  const transacitonPaymentMutation = (): (() => Promise<{
    status: GaloyGQL.PaymentSendResult
    errorsMessage: string
  }>) => {
    switch (paymentType) {
      case "intraledger":
        return wallet.__typename === "UsdWallet" ? payIntraLedgerUsd : payIntraLedger
      case "lightning":
        if (!isNoAmountInvoice) {
          return payLnInvoice
        }
        return wallet.__typename === "UsdWallet"
          ? payLnNoAmountUsdInvoice
          : payLnNoAmountInvoice
      case "onchain":
        return payOnChain
      default:
        throw new Error("Unsupported payment type")
    }
  }

  const sendPayment = async () => {
    setStatus(Status.LOADING)
    try {
      const paymentMutation = transacitonPaymentMutation()
      const { status, errorsMessage } = await paymentMutation()

      if (!errorsMessage && status === "SUCCESS") {
        setStatus(Status.SUCCESS)
        return
      }

      if (status === "ALREADY_PAID") {
        setError("Invoice is already paid")
        return
      }

      setError(errorsMessage || "Something went wrong")
    } catch (err) {
      setStatus(Status.ERROR)
      setError(err.message || err.toString())
    }
  }

  useEffect(() => {
    if (wallet.__typename === "BTCWallet") {
      setSecondaryAmount(
        convertCurrencyAmount({
          amount: paymentAmountToDollarsOrSats(paymentAmount),
          from: paymentAmount.currency,
          to: paymentAmount.currency === "USD" ? "BTC" : "USD",
        }),
      )
    }
  }, [
    paymentAmount.amount,
    paymentAmount.currency,
    convertCurrencyAmount,
    wallet.__typename,
    paymentAmount,
  ])

  let validAmount = false
  let errorMessage

  if (fee.amount && wallet.__typename === "BTCWallet") {
    if (paymentAmount.currency === WalletCurrency.USD) {
      validAmount = secondaryAmount + fee.amount.amount <= 100 * btcWalletBalance
      if (!validAmount) {
        errorMessage = translate("SendBitcoinScreen.amountExceed", {
          balance: usdAmountDisplay(btcWalletValueInUsd),
        })
      }
    }

    if (paymentAmount.currency === WalletCurrency.BTC) {
      validAmount = paymentAmount.amount + fee.amount.amount <= btcWalletBalance
      if (!validAmount) {
        errorMessage = translate("SendBitcoinScreen.amountExceed", {
          balance: satAmountDisplay(btcWalletBalance),
        })
      }
    }
  }

  if (fee.amount && wallet.__typename === "UsdWallet") {
    validAmount = paymentAmount.amount + fee.amount.amount <= usdWalletBalance
    if (!validAmount) {
      errorMessage = translate("SendBitcoinScreen.amountExceed", {
        balance: usdAmountDisplay(usdWalletBalance / 100),
      })
    }
  }

  errorMessage =
    errorMessage ??
    error ??
    (fee.status === "error" && translate("SendBitcoinScreen.feeCalculationUnsuccessful"))

  return (
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
          {wallet.__typename === "BTCWallet" && paymentAmount.currency === "BTC" && (
            <>
              <FakeCurrencyInput
                value={paymentAmountToDollarsOrSats(paymentAmount)}
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
                value={secondaryAmount}
                prefix="$"
                delimiter=","
                separator="."
                precision={2}
                editable={false}
                style={styles.convertedAmountText}
              />
            </>
          )}
          {wallet.__typename === "BTCWallet" && paymentAmount.currency === "USD" && (
            <>
              <FakeCurrencyInput
                value={paymentAmountToDollarsOrSats(paymentAmount)}
                prefix="$"
                delimiter=","
                separator="."
                precision={2}
                style={styles.walletBalanceInput}
                minValue={0}
                editable={false}
              />
              <FakeCurrencyInput
                value={secondaryAmount}
                prefix=""
                delimiter=","
                separator="."
                suffix=" sats"
                precision={0}
                editable={false}
                style={styles.convertedAmountText}
              />
            </>
          )}
          {wallet.__typename === "UsdWallet" && (
            <FakeCurrencyInput
              value={paymentAmountToDollarsOrSats(paymentAmount)}
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
              wallet.__typename === "BTCWallet"
                ? styles.walletSelectorTypeLabelBitcoin
                : styles.walletSelectorTypeLabelUsd
            }
          >
            {wallet.__typename === "BTCWallet" ? (
              <Text style={styles.walletSelectorTypeLabelBtcText}>BTC</Text>
            ) : (
              <Text style={styles.walletSelectorTypeLabelUsdText}>USD</Text>
            )}
          </View>
        </View>
        <View style={styles.walletSelectorInfoContainer}>
          <View style={styles.walletSelectorTypeTextContainer}>
            {wallet.__typename === "BTCWallet" ? (
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
            {wallet.__typename === "BTCWallet" ? (
              <>
                <Text style={styles.walletBalanceText}>
                  {usdAmountDisplay(btcWalletValueInUsd)}
                  {" - "}
                  {satAmountDisplay(btcWalletBalance)}
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
      <Text style={styles.fieldTitleText}>
        {translate("SendBitcoinConfirmationScreen.feeLabel")}
      </Text>
      <View style={styles.fieldBackground}>
        <View style={styles.destinationIconContainer}>
          <FeeIcon />
        </View>
        <Text style={styles.destinationText}>
          {fee.status === "loading" ? <ActivityIndicator /> : feeDisplayText}
        </Text>
      </View>

      {errorMessage && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{translate(errorMessage)}</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        {isLoading && <ActivityIndicator />}
        <Button
          title={translate("SendBitcoinConfirmationScreen.title")}
          buttonStyle={styles.button}
          titleStyle={styles.buttonTitleStyle}
          disabledStyle={[styles.button, styles.disabledButtonStyle]}
          disabledTitleStyle={styles.disabledButtonTitleStyle}
          disabled={isLoading || fee.status !== "set" || !validAmount}
          onPress={sendPayment}
        />
      </View>
    </View>
  )
}

export default SendBitcoinConfirmation
