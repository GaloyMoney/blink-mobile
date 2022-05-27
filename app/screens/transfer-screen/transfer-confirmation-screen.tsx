import React, { useEffect, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { FakeCurrencyInput } from "react-native-currency-input"
import { Button } from "react-native-elements"

import { translateUnknown as translate, useMutation } from "@galoymoney/client"

import { palette } from "@app/theme"
import { useWalletBalance } from "@app/hooks"
import * as currencyFmt from "currency.js"
import { toastShow } from "@app/utils/toast"

const Status = {
  IDLE: "idle",
  LOADING: "loading",
  PENDING: "pending",
  SUCCESS: "success",
  ERROR: "error",
} as const

type StatusType = typeof Status[keyof typeof Status]

const TransferConfirmationScreen = ({
  fromWallet,
  toWallet,
  dollarAmount,
  satAmount,
  satAmountInUsd,
  amountCurrency,
  nextStep,
}: TransferConfirmationScreenProps) => {
  const { usdWalletBalance, btcWalletBalance, btcWalletValueInUsd } = useWalletBalance()
  const [intraLedgerPaymentSend] = useMutation.intraLedgerPaymentSend()
  const [intraLedgerUsdPaymentSend] = useMutation.intraLedgerUsdPaymentSend()
  const [_status, setStatus] = useState<StatusType>(Status.IDLE)

  useEffect(() => {
    if (_status === Status.SUCCESS) {
      nextStep()
    }
  }, [_status, nextStep])

  const handlePaymentReturn = (status, _errors) => {
    if (status === "SUCCESS") {
      setStatus(Status.SUCCESS)
    }
  }

  const handlePaymentError = (error) => {
    console.debug(error)
    toastShow(error?.message)
    //  setStatus(Status.ERROR)
    //  // Todo: provide specific translated error messages in known cases
    //  setErrs([{ message: translate("errors.generic") + error }])
  }

  const isButtonEnabled = () => {
    if (_status === Status.LOADING) {
      return false
    }
    if (fromWallet?.walletCurrency === "BTC" && amountCurrency === "BTC") {
      if (satAmount && satAmount <= btcWalletBalance) {
        return true
      }
    }
    if (fromWallet?.walletCurrency === "BTC" && amountCurrency === "USD") {
      if (satAmountInUsd && satAmountInUsd <= btcWalletValueInUsd) {
        return true
      }
    }
    if (fromWallet?.walletCurrency === "USD") {
      if (dollarAmount && 100 * dollarAmount <= usdWalletBalance) {
        return true
      }
    }
    return false
  }

  const payWallet = async () => {
    setStatus(Status.LOADING)
    if (fromWallet?.walletCurrency === "BTC") {
      try {
        const { data, errorsMessage } = await intraLedgerPaymentSend({
          variables: {
            input: {
              walletId: fromWallet?.id,
              recipientWalletId: toWallet?.id,
              amount: satAmount,
            },
          },
        })

        const status = data.intraLedgerPaymentSend.status
        handlePaymentReturn(status, errorsMessage)
      } catch (err) {
        handlePaymentError(err)
      }
    }
    if (fromWallet?.walletCurrency === "USD") {
      try {
        const { data, errorsMessage } = await intraLedgerUsdPaymentSend({
          variables: {
            input: {
              walletId: fromWallet?.id,
              recipientWalletId: toWallet?.id,
              amount: dollarAmount * 100,
            },
          },
        })

        const status = data.intraLedgerUsdPaymentSend.status
        handlePaymentReturn(status, errorsMessage)
      } catch (err) {
        handlePaymentError(err)
      }
    }
  }

  return (
    <View style={styles.sendBitcoinConfirmationContainer}>
      <Text style={styles.fieldTitleText}>{translate("common.from")}</Text>
      <View style={styles.fieldBackground}>
        <View style={styles.walletSelectorTypeContainer}>
          <View
            style={
              fromWallet?.walletCurrency === "BTC"
                ? styles.walletSelectorTypeLabelBitcoin
                : styles.walletSelectorTypeLabelUsd
            }
          >
            {fromWallet?.walletCurrency === "BTC" ? (
              <Text style={styles.walletSelectorTypeLabelBtcText}>BTC</Text>
            ) : (
              <Text style={styles.walletSelectorTypeLabelUsdText}>USD</Text>
            )}
          </View>
        </View>
        <View style={styles.walletSelectorInfoContainer}>
          <View style={styles.walletSelectorTypeTextContainer}>
            {fromWallet?.walletCurrency === "BTC" ? (
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
            {fromWallet?.walletCurrency === "BTC" ? (
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
      <Text style={styles.fieldTitleText}>{translate("common.to")}</Text>
      <View style={styles.fieldBackground}>
        <View style={styles.walletSelectorTypeContainer}>
          <View
            style={
              toWallet?.walletCurrency === "BTC"
                ? styles.walletSelectorTypeLabelBitcoin
                : styles.walletSelectorTypeLabelUsd
            }
          >
            {toWallet?.walletCurrency === "BTC" ? (
              <Text style={styles.walletSelectorTypeLabelBtcText}>BTC</Text>
            ) : (
              <Text style={styles.walletSelectorTypeLabelUsdText}>USD</Text>
            )}
          </View>
        </View>
        <View style={styles.walletSelectorInfoContainer}>
          <View style={styles.walletSelectorTypeTextContainer}>
            {toWallet?.walletCurrency === "BTC" ? (
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
            {toWallet?.walletCurrency === "BTC" ? (
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
      <Text style={styles.fieldTitleText}>{translate("SendBitcoinScreen.amount")}</Text>
      <View style={styles.fieldBackground}>
        <View style={styles.amountContainer}>
          {fromWallet?.walletCurrency === "BTC" && amountCurrency === "BTC" && (
            <>
              <FakeCurrencyInput
                value={satAmount}
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
                value={satAmountInUsd}
                prefix="$"
                delimiter=","
                separator="."
                precision={2}
                editable={false}
                style={styles.convertedAmountText}
              />
            </>
          )}
          {fromWallet?.walletCurrency === "BTC" && amountCurrency === "USD" && (
            <>
              <FakeCurrencyInput
                value={satAmountInUsd}
                prefix="$"
                delimiter=","
                separator="."
                precision={2}
                style={styles.walletBalanceInput}
                minValue={0}
                editable={false}
              />
              <FakeCurrencyInput
                value={satAmount}
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
          {fromWallet?.walletCurrency === "USD" && (
            <FakeCurrencyInput
              value={dollarAmount}
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
      <View style={styles.buttonContainer}>
        <Button
          title={translate("SendBitcoinConfirmationScreen.title")}
          buttonStyle={styles.button}
          titleStyle={styles.buttonTitleStyle}
          disabledStyle={[styles.button, styles.disabledButtonStyle]}
          disabledTitleStyle={styles.disabledButtonTitleStyle}
          disabled={!isButtonEnabled()}
          onPress={() => payWallet()}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  sendBitcoinConfirmationContainer: {
    flex: 1,
    flexDirection: "column",
    padding: 10,
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
  disabledButtonStyle: {
    backgroundColor: palette.lighterGrey,
  },
  disabledButtonTitleStyle: {
    color: palette.lightBlue,
    fontWeight: "600",
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 10,
  },
})

export default TransferConfirmationScreen
