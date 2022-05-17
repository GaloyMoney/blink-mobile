import React, { useEffect, useState } from "react"
import { ActivityIndicator, Platform, Text, View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { ScrollView, TouchableWithoutFeedback } from "react-native-gesture-handler"
import { FakeCurrencyInput } from "react-native-currency-input"
import { Button } from "react-native-elements"

import { translateUnknown as translate } from "@galoymoney/client"

import { palette } from "@app/theme"
import useMainQuery from "@app/hooks/use-main-query"
import * as currency_fmt from "currency.js"
import { useMySubscription, useWalletBalance } from "@app/hooks"
import SwitchButton from "@app/assets/icons/transfer.svg"

export const TransferScreen = ({ navigation }: TransferScreenProps) => {
  const { wallets, defaultWalletId } = useMainQuery()
  const { usdWalletBalance, btcWalletBalance, btcWalletValueInUsd } = useWalletBalance()
  const { convertCurrencyAmount } = useMySubscription()
  const [fromWallet, setFromWallet] = useState<Wallet>()
  const [toWallet, setToWallet] = useState<Wallet>()
  const [amountCurrency, setAmountCurrency] = useState("USD")
  const [dollarAmount, setDollarAmount] = useState(0)
  const [satAmount, setSatAmount] = useState(0)
  const [satAmountInUsd, setSatAmountInUsd] = useState(0)
  const [amountFieldError, setAmountFieldError] = useState<string>()

  useEffect(() => {
    const defaultWallet = wallets.find((w) => w.id === defaultWalletId)
    const nonDefaultWallet = wallets.find((w) => w.id !== defaultWalletId)
    setFromWallet(nonDefaultWallet)
    setToWallet(defaultWallet)
  }, [wallets, defaultWalletId])

  useEffect(() => {
    if (amountCurrency === "USD") {
      setSatAmount(
        convertCurrencyAmount({
          amount: satAmountInUsd,
          from: "USD",
          to: "BTC",
        }),
      )
    }
    if (amountCurrency === "BTC") {
      setSatAmountInUsd(
        convertCurrencyAmount({
          amount: satAmount,
          from: "BTC",
          to: "USD",
        }),
      )
    }
  }, [satAmount, satAmountInUsd, amountCurrency, convertCurrencyAmount])

  useEffect(() => {
    setDollarAmount(0)
    setSatAmount(0)
    setSatAmountInUsd(0)
  }, [fromWallet, toWallet])

  useEffect(() => {
    if (fromWallet?.walletCurrency === "BTC" && amountCurrency === "BTC") {
      if (satAmount > btcWalletBalance) {
        setAmountFieldError(
          translate("SendBitcoinScreen.amountExceed", {
            balance:
              currency_fmt
                .default(btcWalletBalance, {
                  precision: 0,
                  separator: ",",
                  symbol: "",
                })
                .format() + " sats",
          }),
        )
      } else {
        setAmountFieldError(undefined)
      }
    }

    if (fromWallet?.walletCurrency === "BTC" && amountCurrency === "USD") {
      if (satAmountInUsd > btcWalletValueInUsd) {
        setAmountFieldError(
          translate("SendBitcoinScreen.amountExceed", {
            balance: currency_fmt
              .default(btcWalletValueInUsd, {
                precision: 2,
                separator: ",",
                symbol: "$",
              })
              .format(),
          }),
        )
      } else {
        setAmountFieldError(undefined)
      }
    }
    if (fromWallet?.walletCurrency === "USD") {
      if (dollarAmount > usdWalletBalance) {
        setAmountFieldError(
          translate("SendBitcoinScreen.amountExceed", {
            balance: currency_fmt
              .default(usdWalletBalance / 100, {
                precision: 2,
                separator: ",",
                symbol: "$",
              })
              .format(),
          }),
        )
      } else {
        setAmountFieldError(undefined)
      }
    }
  }, [satAmount, dollarAmount, fromWallet, toWallet])

  const switchWallets = () => {
    setAmountFieldError(undefined)
    setFromWallet(toWallet)
    setToWallet(fromWallet)
  }

  const toggleAmountCurrency = () => {
    if (amountCurrency === "USD") {
      setAmountCurrency("BTC")
    }
    if (amountCurrency === "BTC") {
      setAmountCurrency("USD")
    }
  }

  const setAmountToBalancePercentage = (percentage: number) => {
    if (fromWallet.walletCurrency === "USD") {
      setDollarAmount((usdWalletBalance * (percentage / 100)) / 100)
    }
    if (fromWallet.walletCurrency === "BTC") {
      if (amountCurrency === "USD") {
        setSatAmountInUsd(btcWalletValueInUsd * (percentage / 100))
      }
      if (amountCurrency === "BTC") {
        setSatAmount(btcWalletBalance * (percentage / 100))
      }
    }
  }

  const isButtonEnabled = () => {
    if (fromWallet?.walletCurrency === "BTC" && amountCurrency === "BTC") {
      if (satAmount !== 0 && satAmount < btcWalletBalance) {
        return true
      }
    }
    if (fromWallet?.walletCurrency === "BTC" && amountCurrency === "USD") {
      if (satAmountInUsd !== 0 && satAmountInUsd < btcWalletValueInUsd) {
        return true
      }
    }
    if (fromWallet?.walletCurrency === "USD") {
      if (dollarAmount !== 0 && dollarAmount < usdWalletBalance) {
        return true
      }
    }
    return false
  }

  if (!fromWallet || !toWallet) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    )
  }
  return (
    <ScrollView style={styles.transferScreenContainer}>
      <View style={styles.fieldContainer}>
        <View style={styles.fromFieldContainer}>
          <View style={styles.fieldLabelContainer}>
            <Text style={styles.fieldLabel}>{translate("common.from")}</Text>
          </View>
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
          </View>
        </View>
        <View style={styles.switchButtonContainer}>
          <TouchableWithoutFeedback
            style={styles.switchButton}
            onPress={() => switchWallets()}
          >
            <SwitchButton />
          </TouchableWithoutFeedback>
        </View>
        <View style={styles.toFieldContainer}>
          <View style={styles.fieldLabelContainer}>
            <Text style={styles.fieldLabel}>{translate("common.to")}</Text>
          </View>
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
          </View>
        </View>
      </View>
      <View style={styles.fieldContainer}>
        <View style={styles.amountFieldContainer}>
          <View style={styles.fieldLabelContainer}>
            <Text style={styles.amountFieldLabel}>
              {translate("SendBitcoinScreen.amount")}
            </Text>
          </View>
          <View style={styles.currencyInputContainer}>
            {fromWallet.walletCurrency === "BTC" && amountCurrency === "BTC" && (
              <>
                <FakeCurrencyInput
                  value={satAmount}
                  onChangeValue={setSatAmount}
                  prefix=""
                  delimiter=","
                  separator="."
                  precision={0}
                  suffix=" sats"
                  minValue={0}
                  style={styles.walletBalanceInput}
                />
                <FakeCurrencyInput
                  value={satAmountInUsd}
                  onChangeValue={setSatAmountInUsd}
                  prefix="$"
                  delimiter=","
                  separator="."
                  precision={2}
                  style={styles.convertedAmountText}
                />
              </>
            )}
            {fromWallet.walletCurrency === "BTC" && amountCurrency === "USD" && (
              <>
                <FakeCurrencyInput
                  value={satAmountInUsd}
                  onChangeValue={setSatAmountInUsd}
                  prefix="$"
                  delimiter=","
                  separator="."
                  precision={2}
                  style={styles.walletBalanceInput}
                  minValue={0}
                />
                <FakeCurrencyInput
                  value={satAmount}
                  onChangeValue={setSatAmount}
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
            {fromWallet.walletCurrency === "USD" && (
              <FakeCurrencyInput
                value={dollarAmount}
                onChangeValue={setDollarAmount}
                prefix="$"
                delimiter=","
                separator="."
                precision={2}
                minValue={0}
                style={styles.walletBalanceInput}
              />
            )}
          </View>
          {fromWallet.walletCurrency === "BTC" && (
            <View style={styles.switchCurrencyIconContainer}>
              <TouchableWithoutFeedback onPress={toggleAmountCurrency}>
                <View>
                  <SwitchButton />
                </View>
              </TouchableWithoutFeedback>
            </View>
          )}
        </View>
        {
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{amountFieldError}</Text>
          </View>
        }
      </View>
      <View style={styles.fieldContainer}>
        <View style={styles.percentageContainer}>
          <View style={styles.percentageLabelContainer}>
            <Text style={styles.percentageFieldLabel}>
              {translate("TransferScreen.percentageToConvert")}
            </Text>
          </View>
          <View style={styles.percentageFieldContainer}>
            <TouchableWithoutFeedback onPress={() => setAmountToBalancePercentage(25)}>
              <View style={styles.percentageField}>
                <Text>25%</Text>
              </View>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={() => setAmountToBalancePercentage(50)}>
              <View style={styles.percentageField}>
                <Text>50%</Text>
              </View>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={() => setAmountToBalancePercentage(75)}>
              <View style={styles.percentageField}>
                <Text>75%</Text>
              </View>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={() => setAmountToBalancePercentage(100)}>
              <View style={styles.percentageField}>
                <Text>100%</Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title={translate("common.next")}
          buttonStyle={{ ...styles.button, ...styles.activeButtonStyle }}
          titleStyle={styles.activeButtonTitleStyle}
          disabledStyle={{ ...styles.button, ...styles.disabledButtonStyle }}
          disabledTitleStyle={styles.disabledButtonTitleStyle}
          disabled={!isButtonEnabled()}
          onPress={() =>
            navigation.navigate("transferConfirmation", {
              fromWallet,
              toWallet,
              satAmount,
              satAmountInUsd,
              dollarAmount,
              amountCurrency,
            })
          }
        />
      </View>
    </ScrollView>
  )
}

const styles = EStyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  transferScreenContainer: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
  },
  fieldContainer: {
    padding: 10,
  },
  amountFieldContainer: {
    flexDirection: "row",
    backgroundColor: palette.white,
    borderRadius: 10,
  },
  toFieldContainer: {
    flexDirection: "row",
    backgroundColor: palette.white,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
  },
  switchButtonContainer: {
    height: 1,
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-end",
    zIndex: 30,
  },
  switchButton: {
    height: 50,
    width: 50,
    borderRadius: 50,
    zIndex: 50,
    elevation: Platform.OS === "android" ? 50 : 0,
    backgroundColor: palette.lightGrey,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  fromFieldContainer: {
    flexDirection: "row",
    backgroundColor: palette.white,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
  },
  fieldLabelContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: palette.lapisLazuli,
    padding: 10,
    width: "50rem",
  },
  amountFieldLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: palette.lapisLazuli,
    padding: 10,
    width: "80rem",
  },
  percentageFieldLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: palette.lapisLazuli,
    padding: 10,
    width: "100rem",
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
  walletTypeText: {
    fontWeight: "bold",
    fontSize: 18,
    color: palette.lapisLazuli,
  },
  walletSelectorTypeTextContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  walletSelectorBalanceContainer: {
    flex: 1,
    flexDirection: "row",
  },
  walletBalanceText: {
    color: palette.midGrey,
  },
  walletBalanceInput: {
    color: palette.lapisLazuli,
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 20,
  },
  switchCurrencyIconContainer: {
    width: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  convertedAmountText: {
    color: palette.coolGrey,
    fontSize: 12,
    marginLeft: 20,
  },
  currencyInputContainer: {
    flexDirection: "column",
    flex: 1,
    height: "60rem",
  },
  percentageFieldContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    flex: 4,
  },
  percentageField: {
    backgroundColor: palette.white,
    padding: 10,
    borderRadius: 10,
    fontWeight: "bold",
    flex: 1,
    margin: 4,
  },
  percentageLabelContainer: {
    flex: 1,
  },
  percentageContainer: {
    flexDirection: "row",
  },
  buttonContainer: {
    padding: 10,
    flex: 1,
    paddingTop: "80%",
  },
  button: {
    height: 50,
    borderRadius: 10,
  },
  disabledButtonStyle: {
    backgroundColor: palette.lighterGrey,
  },
  disabledButtonTitleStyle: {
    color: palette.lightBlue,
    fontWeight: "600",
  },
  activeButtonStyle: {
    backgroundColor: palette.lightBlue,
  },
  activeButtonTitleStyle: {
    color: palette.white,
    fontWeight: "bold",
  },
})
