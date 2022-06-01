import { PaymentDestinationDisplay } from "@app/components/payment-destination-display"
import { useMySubscription } from "@app/hooks"
import useMainQuery from "@app/hooks/use-main-query"
import { getFullUri, TYPE_LIGHTNING_BTC, TYPE_BITCOIN_ONCHAIN } from "@app/utils/wallet"
import { GaloyGQL, translateUnknown as translate, useMutation } from "@galoymoney/client"
import Clipboard from "@react-native-community/clipboard"
import debounce from "lodash.debounce"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { ActivityIndicator, Alert, Pressable, Share, View } from "react-native"
import { Text } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import QRView from "./qr-view"
import Icon from "react-native-vector-icons/Ionicons"
import { FakeCurrencyInput } from "react-native-currency-input"
import { palette } from "@app/theme"
import SwitchIcon from "@app/assets/icons/switch.svg"
import Toast from "react-native-toast-message"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"

import CalculatorIcon from "@app/assets/icons/calculator.svg"
import ChevronIcon from "@app/assets/icons/chevron.svg"
import ChainIcon from "@app/assets/icons/chain.svg"

const styles = EStyleSheet.create({
  fieldsContainer: {
    marginTop: "20rem",
    marginLeft: 20,
    marginRight: 20,
  },
  field: {
    padding: 10,
    height: "50rem",
    backgroundColor: palette.white,
    borderRadius: 10,
    marginTop: 10,
  },
  currencyInputField: {
    padding: 10,
    height: "80rem",
    backgroundColor: palette.white,
    borderRadius: 10,
    marginTop: 10,
  },
  infoText: {
    color: palette.midGrey,
    fontSize: "15rem",
  },
  copyInvoiceContainer: {
    flex: 2,
  },
  shareInvoiceContainer: {
    flex: 2,
    alignItems: "flex-end",
  },
  textContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  optionsContainer: {
    marginTop: 30,
  },
  fieldContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  fieldIconContainer: {
    justifyContent: "center",
    marginRight: 10,
  },
  fieldTextContainer: {
    flex: 4,
    justifyContent: "center",
  },
  fieldArrowContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  fieldText: {
    color: palette.lapisLazuli,
    fontSize: "15rem",
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
  switchCurrencyIconContainer: {
    width: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  currencyInput: {
    flexDirection: "column",
    flex: 1,
  },
  toggle: {
    justifyContent: "flex-end",
  },
})
const ReceiveBtc = () => {
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState("")
  const [invoice, setInvoice] = useState<
    GaloyGQL.LnInvoice | GaloyGQL.LnNoAmountInvoice | null
  >(null)
  const [btcAddress, setBtcAddress] = useState<string | null>(null)
  const [satAmount, setSatAmount] = useState(0)
  const [satAmountInUsd, setSatAmountInUsd] = useState(0)
  const [memo] = useState("") // FIXME
  const [isAmountless, setIsAmountless] = useState(true)
  const [amountCurrency, setAmountCurrency] = useState("USD")

  const [paymentLayer, setPaymentLayer] = useState<"BITCOIN_ONCHAIN" | "LIGHTNING_BTC">(
    TYPE_LIGHTNING_BTC,
  )

  const { btcWalletId } = useMainQuery()
  const { lnUpdate, convertCurrencyAmount } = useMySubscription()

  const [lnNoAmountInvoiceCreate] = useMutation.lnNoAmountInvoiceCreate()
  const [lnInvoiceCreate] = useMutation.lnInvoiceCreate()
  const [generateBtcAddress] = useMutation.onChainAddressCurrent()

  const updateSatAmount = (newValue) => {
    // eslint-disable-next-line no-negated-condition
    if (!newValue) {
      setSatAmount(0)
    } else {
      setSatAmount(newValue)
    }
  }

  const updateSatAmountInUsd = (newValue) => {
    // eslint-disable-next-line no-negated-condition
    if (!newValue) {
      setSatAmountInUsd(0)
    } else {
      setSatAmountInUsd(newValue)
    }
  }

  const updateInvoice = useMemo(
    () =>
      debounce(
        async ({ walletId, satAmount, memo }) => {
          setLoading(true)
          setInvoice(null)
          try {
            if (satAmount === 0) {
              const {
                data: {
                  lnNoAmountInvoiceCreate: { invoice, errors },
                },
              } = await lnNoAmountInvoiceCreate({
                variables: { input: { walletId, memo } },
              })
              if (errors && errors.length !== 0) {
                console.error(errors, "error with lnNoAmountInvoiceCreate")
                setErr(translate("ReceiveBitcoinScreen.error"))
                return
              }
              setInvoice(invoice)
            } else {
              const {
                data: {
                  lnInvoiceCreate: { invoice, errors },
                },
              } = await lnInvoiceCreate({
                variables: {
                  input: { walletId, amount: satAmount, memo },
                },
              })
              if (errors && errors.length !== 0) {
                console.error(errors, "error with lnInvoiceCreate")
                setErr(translate("ReceiveBitcoinScreen.error"))
                return
              }
              setInvoice(invoice)
            }
          } catch (err) {
            console.error(err, "error with AddInvoice")
            setErr(`${err}`)
            throw err
          } finally {
            setLoading(false)
          }
        },
        1000,
        { trailing: true },
      ),
    [lnInvoiceCreate, lnNoAmountInvoiceCreate],
  )

  const updateBtcAddress = useMemo(
    () =>
      debounce(
        async ({ walletId }) => {
          setLoading(true)
          try {
            const {
              data: {
                onChainAddressCurrent: { address, errors },
              },
            } = await generateBtcAddress({
              variables: {
                input: { walletId },
              },
            })
            if (errors && errors.length !== 0) {
              console.error(errors, "error with generateBtcAddress")
              setErr(translate("ReceiveBitcoinScreen.error"))
              return
            }
            setBtcAddress(address)
          } catch (err) {
            console.error(err, "error with updateBtcAddress")
            setErr(`${err}`)
            throw err
          } finally {
            setLoading(false)
          }
        },
        1000,
        { trailing: true },
      ),
    [generateBtcAddress],
  )

  const toggleAmountCurrency = () => {
    if (amountCurrency === "USD") {
      setAmountCurrency("BTC")
    }
    if (amountCurrency === "BTC") {
      setAmountCurrency("USD")
    }
  }

  useEffect((): void | (() => void) => {
    if (btcWalletId) {
      if (paymentLayer === TYPE_LIGHTNING_BTC) {
        updateInvoice({ walletId: btcWalletId, satAmount, memo })
        return () => updateInvoice.cancel()
      }
      if (paymentLayer === TYPE_BITCOIN_ONCHAIN && !btcAddress) {
        updateBtcAddress({ walletId: btcWalletId })
        return () => updateBtcAddress.cancel()
      }
    }
  }, [
    btcAddress,
    btcWalletId,
    memo,
    paymentLayer,
    satAmount,
    updateBtcAddress,
    updateInvoice,
  ])

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

  const paymentDestination =
    paymentLayer === TYPE_LIGHTNING_BTC ? invoice?.paymentRequest : btcAddress

  const paymentFullUri = getFullUri({
    type: paymentLayer,
    input: paymentDestination,
    amount: satAmount,
    memo,
    prefix: false,
  })

  const copyToClipboard = useCallback(() => {
    Clipboard.setString(paymentFullUri)
    Toast.show({
      type: "info",
      text1: translate("ReceiveBitcoinScreen.copyClipboard"),
      position: "bottom",
      bottomOffset: 80,
    })
  }, [paymentFullUri])

  const share = useCallback(async () => {
    try {
      const result = await Share.share({ message: paymentFullUri })

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      Alert.alert(error.message)
    }
  }, [paymentFullUri])

  const togglePaymentLayer = () => {
    setInvoice(null)
    setPaymentLayer((currentPaymentLayer) => {
      return currentPaymentLayer === TYPE_LIGHTNING_BTC
        ? TYPE_BITCOIN_ONCHAIN
        : TYPE_LIGHTNING_BTC
    })
  }

  const invoicePaid =
    lnUpdate?.paymentHash === invoice?.paymentHash && lnUpdate?.status === "PAID"

  return (
    <KeyboardAwareScrollView>
      <Pressable onPress={copyToClipboard}>
        <QRView
          data={paymentDestination}
          type={paymentLayer}
          amount={satAmount}
          memo={memo}
          loading={loading || !paymentDestination}
          completed={paymentLayer === TYPE_LIGHTNING_BTC ? invoicePaid : false}
          err={err}
        />
      </Pressable>
      <View style={styles.fieldsContainer}>
        <View style={styles.field}>
          {!loading && <PaymentDestinationDisplay data={paymentDestination} />}
          {loading && <ActivityIndicator />}
        </View>

        <View style={styles.textContainer}>
          <View style={styles.copyInvoiceContainer}>
            <Pressable onPress={copyToClipboard}>
              <Text style={styles.infoText}>
                <Icon style={styles.infoText} name="copy-outline" />{" "}
                {translate(
                  paymentLayer === TYPE_LIGHTNING_BTC
                    ? "ReceiveBitcoinScreen.copyInvoice"
                    : "Copy Address",
                )}
              </Text>
            </Pressable>
          </View>
          <View style={styles.shareInvoiceContainer}>
            <Pressable onPress={share}>
              <Text style={styles.infoText}>
                <Icon style={styles.infoText} name="share-outline" />{" "}
                {translate(
                  paymentLayer === TYPE_LIGHTNING_BTC
                    ? "ReceiveBitcoinScreen.shareInvoice"
                    : "Share Address",
                )}
              </Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.optionsContainer}>
          {isAmountless && (
            <View style={styles.field}>
              <Pressable onPress={() => setIsAmountless(false)}>
                <View style={styles.fieldContainer}>
                  <View style={styles.fieldIconContainer}>
                    <CalculatorIcon />
                  </View>
                  <View style={styles.fieldTextContainer}>
                    <Text style={styles.fieldText}>
                      {translate("ReceiveBitcoinScreen.addAmount")}
                    </Text>
                  </View>
                  <View style={styles.fieldArrowContainer}>
                    <ChevronIcon />
                  </View>
                </View>
              </Pressable>
            </View>
          )}
          {!isAmountless && (
            <View style={styles.currencyInputField}>
              <View style={styles.fieldContainer}>
                <View style={styles.currencyInput}>
                  {amountCurrency === "BTC" && (
                    <>
                      <FakeCurrencyInput
                        value={satAmount}
                        onChangeValue={updateSatAmount}
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
                        onChangeValue={updateSatAmountInUsd}
                        prefix="$"
                        delimiter=","
                        separator="."
                        precision={2}
                        editable={false}
                        style={styles.convertedAmountText}
                      />
                    </>
                  )}
                  {amountCurrency === "USD" && (
                    <>
                      <FakeCurrencyInput
                        value={satAmountInUsd}
                        onChangeValue={updateSatAmountInUsd}
                        prefix="$"
                        delimiter=","
                        separator="."
                        precision={2}
                        style={styles.walletBalanceInput}
                        minValue={0}
                      />
                      <FakeCurrencyInput
                        value={satAmount}
                        onChangeValue={updateSatAmount}
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
                </View>
                <View style={styles.toggle}>
                  <Pressable onPress={toggleAmountCurrency}>
                    <View style={styles.switchCurrencyIconContainer}>
                      <SwitchIcon />
                    </View>
                  </Pressable>
                </View>
              </View>
            </View>
          )}
          <View style={styles.field}>
            <Pressable onPress={togglePaymentLayer}>
              <View style={styles.fieldContainer}>
                <View style={styles.fieldIconContainer}>
                  <ChainIcon />
                </View>
                <View style={styles.fieldTextContainer}>
                  <Text style={styles.fieldText}>
                    {translate(
                      paymentLayer === TYPE_LIGHTNING_BTC
                        ? "Use a Bitcoin on-chain address"
                        : "Use a Lightning invoice",
                    )}
                  </Text>
                </View>
                <View style={styles.fieldArrowContainer}>
                  <ChevronIcon />
                </View>
              </View>
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAwareScrollView>
  )
}

export default ReceiveBtc
