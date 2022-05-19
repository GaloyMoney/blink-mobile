import { useMySubscription, useWalletBalance } from "@app/hooks"
import useMainQuery from "@app/hooks/use-main-query"
import { palette } from "@app/theme"
import React, { useEffect, useState } from "react"
import { StyleSheet, View, TouchableWithoutFeedback, TextInput } from "react-native"
import { Button, Text } from "react-native-elements"
import * as currency_fmt from "currency.js"
import ReactNativeModal from "react-native-modal"
import { FakeCurrencyInput } from "react-native-currency-input"
import SwitchIcon from "@app/assets/icons/switch.svg"
import { translateUnknown as translate } from "@galoymoney/client"
import NoteIcon from "@app/assets/icons/note.svg"
import { ScrollView } from "react-native-gesture-handler"

const Styles = StyleSheet.create({
  sendBitcoinAmountContainer: {
    flex: 1,
    flexDirection: "column",
  },
  fieldBackground: {
    flexDirection: "row",
    borderStyle: "solid",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: palette.white,
    backgroundColor: palette.white,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    height: 60,
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
  walletTitleContainer: {
    flex: 1,
  },
  walletBalanceContainer: {
    flex: 1,
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
  fieldTitleText: {
    fontWeight: "bold",
    color: palette.lapisLazuli,
  },
  fieldContainer: {
    padding: 10,
  },
  currencyInputContainer: {
    flexDirection: "column",
    flex: 1,
  },
  switchCurrencyIconContainer: {
    width: 50,
    justifyContent: "center",
    alignItems: "center",
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
  errorContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  errorText: {
    fontSize: 12,
    color: palette.red,
  },
  noteContainer: {
    flex: 1,
    flexDirection: "row",
  },
  noteIconContainer: {
    width: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  noteIcon: {
    justifyContent: "center",
    alignItems: "center",
  },
  noteInput: {
    flex: 1,
  },
  button: {
    height: 60,
    borderRadius: 10,
    marginBottom: 20,
    marginTop: 20,
  },
  disabledButtonStyle: {
    backgroundColor: "rgba(83, 111, 242, 0.1)",
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
  chooseWalletModalView: { flex: 1 },
})

const SendBitcoinAmount = ({
  nextStep,
  defaultWallet,
  fromWallet,
  setFromWallet,
  note,
  setNote,
  amountCurrency,
  toggleAmountCurrency,
  setAmount,
  defaultAmount = 0,
  amountless,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const { wallets } = useMainQuery()
  const { usdWalletBalance, btcWalletBalance, btcWalletValueInUsd } = useWalletBalance()
  const [dollarAmount, setDollarAmount] = useState(0)
  const [satAmount, setSatAmount] = useState(0)
  const [satAmountInUsd, setSatAmountInUsd] = useState(0)
  const { convertCurrencyAmount } = useMySubscription()

  useEffect(() => {
    if (defaultAmount) {
      setDollarAmount(defaultAmount)
      setSatAmountInUsd(defaultAmount)
    }
  }, [defaultAmount])

  useEffect(() => {
    setFromWallet(defaultWallet)
  }, [defaultWallet, setFromWallet])

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

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible)
  }

  const validate = (): boolean => {
    if (fromWallet.__typename === "UsdWallet" && dollarAmount) {
      return true
    }
    if (fromWallet.__typename === "BTCWallet" && satAmount) {
      return true
    }
    return false
  }
  if (!defaultWallet) {
    return <></>
  }
  const chooseWalletModal = (
    <ReactNativeModal isVisible={isModalVisible} onBackButtonPress={() => toggleModal()}>
      <View style={Styles.chooseWalletModalView}>
        {wallets?.map((wallet) => {
          return (
            <TouchableWithoutFeedback
              key={wallet.id}
              onPress={() => {
                console.log("pressed")
                setFromWallet(wallet)
                toggleModal()
              }}
            >
              <View style={Styles.fieldBackground}>
                <View style={Styles.walletSelectorTypeContainer}>
                  <View
                    style={
                      wallet.__typename === "BTCWallet"
                        ? Styles.walletSelectorTypeLabelBitcoin
                        : Styles.walletSelectorTypeLabelUsd
                    }
                  >
                    {wallet.__typename === "BTCWallet" ? (
                      <Text style={Styles.walletSelectorTypeLabelBtcText}>BTC</Text>
                    ) : (
                      <Text style={Styles.walletSelectorTypeLabelUsdText}>USD</Text>
                    )}
                  </View>
                </View>
                <View style={Styles.walletSelectorInfoContainer}>
                  <View style={Styles.walletSelectorTypeTextContainer}>
                    {wallet.__typename === "BTCWallet" ? (
                      <>
                        <Text style={Styles.walletTypeText}>Bitcoin Wallet</Text>
                      </>
                    ) : (
                      <>
                        <Text style={Styles.walletTypeText}>US Dollar Wallet</Text>
                      </>
                    )}
                  </View>
                  <View style={Styles.walletSelectorBalanceContainer}>
                    {wallet.__typename === "BTCWallet" ? (
                      <>
                        <Text style={Styles.walletBalanceText}>
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
                        <Text style={Styles.walletBalanceText}>
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
            </TouchableWithoutFeedback>
          )
        })}
      </View>
    </ReactNativeModal>
  )

  return (
    <ScrollView style={Styles.sendBitcoinAmountContainer}>
      <View style={Styles.fieldContainer}>
        <Text style={Styles.fieldTitleText}>{translate("common.from")}</Text>
        <TouchableWithoutFeedback onPress={toggleModal}>
          <View style={Styles.fieldBackground}>
            <View style={Styles.walletSelectorTypeContainer}>
              <View
                style={
                  fromWallet.__typename === "BTCWallet"
                    ? Styles.walletSelectorTypeLabelBitcoin
                    : Styles.walletSelectorTypeLabelUsd
                }
              >
                {fromWallet.__typename === "BTCWallet" ? (
                  <Text style={Styles.walletSelectorTypeLabelBtcText}>BTC</Text>
                ) : (
                  <Text style={Styles.walletSelectorTypeLabelUsdText}>USD</Text>
                )}
              </View>
            </View>
            <View style={Styles.walletSelectorInfoContainer}>
              <View style={Styles.walletSelectorTypeTextContainer}>
                {fromWallet.__typename === "BTCWallet" ? (
                  <>
                    <Text style={Styles.walletTypeText}>Bitcoin Wallet</Text>
                  </>
                ) : (
                  <>
                    <Text style={Styles.walletTypeText}>US Dollar Wallet</Text>
                  </>
                )}
              </View>
              <View style={Styles.walletSelectorBalanceContainer}>
                {fromWallet.__typename === "BTCWallet" ? (
                  <>
                    <Text style={Styles.walletBalanceText}>
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
                    <Text style={Styles.walletBalanceText}>
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
        </TouchableWithoutFeedback>
        {chooseWalletModal}
      </View>
      <View style={Styles.fieldContainer}>
        <Text style={Styles.fieldTitleText}>{translate("SendBitcoinScreen.amount")}</Text>
        <View style={Styles.fieldBackground}>
          <View style={Styles.currencyInputContainer}>
            {fromWallet.__typename === "BTCWallet" && amountCurrency === "BTC" && (
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
                  editable={amountless}
                  style={Styles.walletBalanceInput}
                />
                <FakeCurrencyInput
                  value={satAmountInUsd}
                  onChangeValue={setSatAmountInUsd}
                  prefix="$"
                  delimiter=","
                  separator="."
                  precision={2}
                  editable={false}
                  style={Styles.convertedAmountText}
                />
              </>
            )}
            {fromWallet.__typename === "BTCWallet" && amountCurrency === "USD" && (
              <>
                <FakeCurrencyInput
                  value={satAmountInUsd}
                  onChangeValue={setSatAmount}
                  prefix="$"
                  delimiter=","
                  separator="."
                  precision={2}
                  style={Styles.walletBalanceInput}
                  minValue={0}
                  editable={amountless}
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
                  style={Styles.convertedAmountText}
                />
              </>
            )}
            {fromWallet.__typename === "UsdWallet" && (
              <FakeCurrencyInput
                value={dollarAmount}
                onChangeValue={setDollarAmount}
                prefix="$"
                delimiter=","
                separator="."
                precision={2}
                minValue={0}
                style={Styles.walletBalanceInput}
                editable={amountless}
              />
            )}
          </View>
          {fromWallet.__typename === "BTCWallet" && (
            <TouchableWithoutFeedback onPress={toggleAmountCurrency}>
              <View style={Styles.switchCurrencyIconContainer}>
                <SwitchIcon />
              </View>
            </TouchableWithoutFeedback>
          )}
        </View>
        {
          <View style={Styles.errorContainer}>
            <Text style={Styles.errorText}></Text>
          </View>
        }
      </View>
      <View style={Styles.fieldContainer}>
        <Text style={Styles.fieldTitleText}>{translate("SendBitcoinScreen.note")}</Text>
        <View style={Styles.fieldBackground}>
          <View style={Styles.noteContainer}>
            <View style={Styles.noteIconContainer}>
              <NoteIcon style={Styles.noteIcon} />
            </View>
            <TextInput
              style={Styles.noteInput}
              placeholder={translate("SendBitcoinScreen.input")}
              onChangeText={setNote}
              value={note}
              selectTextOnFocus
            />
          </View>
        </View>
      </View>
      <View>
        <Button
          title={
            !validate()
              ? translate("SendBitcoinScreen.amountIsRequired")
              : translate("common.next")
          }
          buttonStyle={{ ...Styles.button, ...Styles.activeButtonStyle }}
          titleStyle={Styles.activeButtonTitleStyle}
          disabledStyle={{ ...Styles.button, ...Styles.disabledButtonStyle }}
          disabledTitleStyle={Styles.disabledButtonTitleStyle}
          disabled={!validate()}
          onPress={() => {
            if (fromWallet.__typename === "UsdWallet") {
              setAmount(dollarAmount)
            }
            if (fromWallet.__typename === "BTCWallet" && amountCurrency === "USD") {
              setAmount(satAmountInUsd)
            }
            if (fromWallet.__typename === "BTCWallet" && amountCurrency === "BTC") {
              setAmount(satAmount)
            }
            nextStep()
          }}
        />
      </View>
    </ScrollView>
  )
}

export default SendBitcoinAmount
