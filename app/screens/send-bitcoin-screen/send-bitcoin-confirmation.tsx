import { translate } from "@app/i18n"
import { palette } from "@app/theme"
import React, { useEffect, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import DestinationIcon from "@app/assets/icons/destination.svg"
import { FakeCurrencyInput } from "react-native-currency-input"
import { useMySubscription, useWalletBalance } from "@app/hooks"
import * as currency_fmt from "currency.js"
import { Button } from "react-native-elements"
import FeeIcon from "@app/assets/icons/fee.svg"
import useFee from "./use-fee"
import { gql, useMutation } from "@apollo/client"

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
})

export const LN_PAY = gql`
  mutation lnInvoicePaymentSend($input: LnInvoicePaymentInput!) {
    lnInvoicePaymentSend(input: $input) {
      errors {
        message
      }
      status
    }
  }
`

const LN_NO_AMOUNT_PAY = gql`
  mutation lnNoAmountInvoicePaymentSend($input: LnNoAmountInvoicePaymentInput!) {
    lnNoAmountInvoicePaymentSend(input: $input) {
      errors {
        message
      }
      status
    }
  }
`

const LN_NO_AMOUNT_PAY_USD = gql`
  mutation LnNoAmountUsdInvoicePaymentSend($input: LnNoAmountUsdInvoicePaymentInput!) {
    lnNoAmountUsdInvoicePaymentSend(input: $input) {
      errors {
        message
      }
      status
    }
  }
`

const SendBitcoinConfirmation = ({
  destination,
  wallet,
  amount,
  amountCurrency,
  note,
  amountless,
  paymentType,
  sameNode,
}) => {
  const { convertCurrencyAmount } = useMySubscription()
  const [secondaryAmount, setSecondaryAmount] = useState(0)
  const { usdWalletBalance, btcWalletBalance, btcWalletValueInUsd } = useWalletBalance()
  const [status, setStatus] = useState<StatusType>(Status.IDLE)
  const [lnPay] = useMutation(LN_PAY)

  const [lnNoAmountPay] = useMutation(LN_NO_AMOUNT_PAY)
  const [lnNoAmountPayUsd] = useMutation(LN_NO_AMOUNT_PAY_USD)
  const fee = useFee({
    walletId: wallet.id,
    address: destination,
    amountless,
    invoice: destination,
    paymentType,
    sameNode,
    paymentSatAmount: convertCurrencyAmount({
      from: "USD",
      to: "BTC",
      amount: amount,
    }),
    primaryCurrency: amountCurrency,
  })

  const handlePaymentReturn = (status, errors) => {
    if (status === "SUCCESS") {
      setStatus(Status.SUCCESS)
    }
  }

  const handlePaymentError = (error) => {
    console.log(error)
    //  setStatus(Status.ERROR)
    //  // Todo: provide specific translated error messages in known cases
    //  setErrs([{ message: translate("errors.generic") + error }])
  }

  const payLightning = async () => {
    setStatus(Status.LOADING)
    try {
      const { data, errors } = await lnPay({
        variables: {
          input: {
            walletId: wallet.id,
            paymentRequest: destination,
            memo: note,
          },
        },
      })

      const status = data.lnInvoicePaymentSend.status
      const errs = errors
        ? errors.map((error) => {
            return { message: error.message }
          })
        : data.lnInvoicePaymentSend.errors
      handlePaymentReturn(status, errs)
    } catch (err) {
      handlePaymentError(err)
    }
  }

  const payAmountlessLightning = async () => {
    setStatus(Status.LOADING)
    try {
      const { data, errors } = await lnNoAmountPay({
        variables: {
          input: {
            walletId: wallet.id,
            paymentRequest: destination,
            amount: amount,
            memo: note,
          },
        },
      })

      const status = data.lnNoAmountInvoicePaymentSend.status
      const errs = errors
        ? errors.map((error) => {
            return { message: error.message }
          })
        : data.lnNoAmountInvoicePaymentSend.errors
      handlePaymentReturn(status, errs)
    } catch (err) {
      handlePaymentError(err)
    }
  }

  const payAmountlessLightningUsd = async () => {
    setStatus(Status.LOADING)
    try {
      const { data, errors } = await lnNoAmountPayUsd({
        variables: {
          input: {
            walletId: wallet.id,
            paymentRequest: destination,
            amount: amount * 100,
            memo: note,
          },
        },
      })
      console.log(data)
      const status = data.lnNoAmountUsdInvoicePaymentSend.status
      console.log(data.lnNoAmountUsdInvoicePaymentSend.errors)
      const errs = errors
        ? errors.map((error) => {
            return { message: error.message }
          })
        : data.lnNoAmountUsdInvoicePaymentSend.errors
      handlePaymentReturn(status, errs)
    } catch (err) {
      handlePaymentError(err)
    }
  }

  const pay = async () => {
    console.log(paymentType)
    console.log(amountless)
    if (paymentType === "lightning") {
      if (amountless) {
        if (wallet.__typename === "UsdWallet") {
          payAmountlessLightningUsd()
          return
        }
        payAmountlessLightning()
      } else {
        payLightning()
      }
      return
    }
  }

  useEffect(() => {
    if (wallet.__typename === "BtcWallet" && amountCurrency === "USD") {
      setSecondaryAmount(
        convertCurrencyAmount({
          amount: amount,
          from: "USD",
          to: "BTC",
        }),
      )
    }
    if (wallet.__typename === "BtcWallet" && amountCurrency === "USD") {
      setSecondaryAmount(
        convertCurrencyAmount({
          amount: amount,
          from: "BTC",
          to: "USD",
        }),
      )
    }
  }, [amount, amountCurrency])
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
                  {currency_fmt
                    .default(btcWalletValueInUsd, {
                      precision: 2,
                      separator: ",",
                      symbol: "$",
                    })
                    .format()}
                  {" - "}
                  {currency_fmt
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
                  {currency_fmt
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
      <View style={styles.buttonContainer}>
        <Button
          title={translate("SendBitcoinConfirmationScreen.title")}
          buttonStyle={styles.button}
          titleStyle={styles.buttonTitleStyle}
          onPress={() => pay()}
        />
      </View>
    </View>
  )
}

export default SendBitcoinConfirmation
