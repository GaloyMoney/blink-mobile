import { GaloyGQL, translateUnknown as translate, useMutation } from "@galoymoney/client"
import { palette } from "@app/theme"
import React, { useEffect, useState } from "react"
import { ActivityIndicator, StyleSheet, Text, View } from "react-native"
import DestinationIcon from "@app/assets/icons/destination.svg"
import { FakeCurrencyInput } from "react-native-currency-input"
import { useMySubscription, useWalletBalance } from "@app/hooks"
import * as currencyFmt from "currency.js"
import { Button } from "react-native-elements"
import FeeIcon from "@app/assets/icons/fee.svg"
import useFee from "./use-fee"

const Status = {
  IDLE: "idle",
  LOADING: "loading",
  PENDING: "pending",
  SUCCESS: "success",
  ERROR: "error",
} as const

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
    marginBottom: 5,
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
    padding: 10,
  },
  errorContainer: {
    margin: 25,
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

const SendBitcoinConfirmation = ({
  destination,
  recipientWalletId,
  wallet,
  amount,
  amountCurrency,
  note,
  fixedAmount,
  paymentType,
  sameNode,
  setStatus,
}) => {
  const { convertCurrencyAmount } = useMySubscription()
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

  const isLoading =
    intraledgerLoading ||
    intraLedgerUsdLoading ||
    lnInvoiceLoading ||
    lnNoAmountInvoiceLoading ||
    lnNoAmountUsdLoading ||
    onChainLoading

  const fee = useFee({
    walletId: wallet.id,
    address: destination,
    amountless: !fixedAmount,
    invoice: destination,
    paymentType,
    sameNode,
    paymentSatAmount: convertCurrencyAmount({
      from: "USD",
      to: "BTC",
      amount,
    }),
    primaryCurrency: amountCurrency,
  })

  const payIntraLedger = async () => {
    const { data, errorsMessage } = await intraLedgerPaymentSend({
      variables: {
        input: {
          walletId: wallet.id,
          recipientWalletId,
          amount: amountCurrency === "USD" ? secondaryAmount : amount,
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
          amount: amount * 100,
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
          amount: amountCurrency === "USD" ? secondaryAmount : amount,
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
          amount: amount * 100,
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
          amount: amountCurrency === "USD" ? secondaryAmount : amount,
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
        if (fixedAmount) {
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
          amount,
          from: amountCurrency,
          to: amountCurrency === "USD" ? "BTC" : "USD",
        }),
      )
    }
  }, [amount, amountCurrency, convertCurrencyAmount, wallet.__typename])

  return (
    <View style={styles.sendBitcoinConfirmationContainer}>
      <Text style={styles.fieldTitleText}>
        {translate("SendBitcoinScreen.destination")}
      </Text>
      <View style={styles.fieldBackground}>
        <View style={styles.destinationIconContainer}>
          <DestinationIcon />
        </View>
        <Text style={styles.destinationText}>{destination}</Text>
      </View>
      <Text style={styles.fieldTitleText}>{translate("SendBitcoinScreen.amount")}</Text>
      <View style={styles.fieldBackground}>
        <View style={styles.amountContainer}>
          {wallet.__typename === "BTCWallet" && amountCurrency === "BTC" && (
            <>
              <FakeCurrencyInput
                value={amount}
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
          {wallet.__typename === "BTCWallet" && amountCurrency === "USD" && (
            <>
              <FakeCurrencyInput
                value={amount}
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
              value={amount}
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
                  {currencyFmt
                    .default(btcWalletValueInUsd, {
                      precision: 2,
                      separator: ",",
                      symbol: "$",
                    })
                    .format()}
                  {" - "}
                  {currencyFmt
                    .default(btcWalletBalance, {
                      precision: 0,
                      separator: ",",
                      symbol: "",
                    })
                    .format()}
                  {" sats"}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.walletBalanceText}>
                  {currencyFmt
                    .default(usdWalletBalance / 100, {
                      precision: 2,
                      separator: ",",
                      symbol: "$",
                    })
                    .format()}
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
        <Text style={styles.destinationText}>{fee?.text}</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{translate(error)}</Text>
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
          disabled={isLoading}
          onPress={sendPayment}
        />
      </View>
    </View>
  )
}

export default SendBitcoinConfirmation
