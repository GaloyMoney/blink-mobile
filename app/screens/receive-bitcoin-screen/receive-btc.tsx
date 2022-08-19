import { usePriceConversion, useSubscriptionUpdates } from "@app/hooks"
import useMainQuery from "@app/hooks/use-main-query"
import { getFullUri, TYPE_LIGHTNING_BTC, TYPE_BITCOIN_ONCHAIN } from "@app/utils/wallet"
import { GaloyGQL, useMutation } from "@galoymoney/client"
import React, { useCallback, useEffect, useState } from "react"
import { Alert, Pressable, Share, TextInput, View } from "react-native"
import { Button, Text } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import QRView from "./qr-view"
import Icon from "react-native-vector-icons/Ionicons"
import { FakeCurrencyInput } from "react-native-currency-input"
import { palette } from "@app/theme"
import SwitchIcon from "@app/assets/icons/switch.svg"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { satAmountDisplay, usdAmountDisplay } from "@app/utils/currencyConversion"
import CalculatorIcon from "@app/assets/icons/calculator.svg"
import ChevronIcon from "@app/assets/icons/chevron.svg"
import ChainIcon from "@app/assets/icons/chain.svg"
import NoteIcon from "@app/assets/icons/note.svg"
import { toastShow } from "@app/utils/toast"
import { translate } from "@app/utils/translate"
import { copyPaymentInfoToClipboard } from "@app/utils/clipboard"

const styles = EStyleSheet.create({
  container: {
    marginTop: "14rem",
    marginLeft: 20,
    marginRight: 20,
  },
  field: {
    padding: 10,
    backgroundColor: palette.white,
    borderRadius: 10,
    marginBottom: 12,
  },
  inputForm: {
    marginVertical: 20,
  },
  currencyInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: palette.white,
    borderRadius: 10,
  },
  infoText: {
    color: palette.midGrey,
    fontSize: "12rem",
  },
  copyInvoiceContainer: {
    flex: 2,
    marginLeft: 10,
  },
  shareInvoiceContainer: {
    flex: 2,
    alignItems: "flex-end",
    marginRight: 10,
  },
  textContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 6,
  },
  optionsContainer: {
    marginTop: 20,
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
    fontSize: "14rem",
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
  button: {
    height: 60,
    borderRadius: 10,
    marginTop: 40,
  },
  activeButtonStyle: {
    backgroundColor: palette.lightBlue,
  },
  activeButtonTitleStyle: {
    color: palette.white,
    fontWeight: "bold",
  },
  invoiceInfo: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 14,
  },
  primaryAmount: {
    fontWeight: "bold",
  },
  convertedAmount: {
    color: palette.coolGrey,
    marginLeft: 5,
  },
  fieldTitleText: {
    fontWeight: "bold",
    color: palette.lapisLazuli,
    marginBottom: 5,
  },
  disabledButtonStyle: {
    backgroundColor: palette.lighterGrey,
  },
  disabledButtonTitleStyle: {
    color: palette.lightBlue,
    fontWeight: "600",
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
  const [usdAmount, setUsdAmount] = useState(0)
  const [memo, setMemo] = useState("")
  const [showMemoInput, setShowMemoInput] = useState(false)
  const [showAmountInput, setShowAmountInput] = useState(false)
  const [amountCurrency, setAmountCurrency] = useState("USD")

  const [paymentLayer, setPaymentLayer] = useState<"BITCOIN_ONCHAIN" | "LIGHTNING_BTC">(
    TYPE_LIGHTNING_BTC,
  )
  const { convertCurrencyAmount } = usePriceConversion()
  const { btcWalletId } = useMainQuery()
  const { lnUpdate } = useSubscriptionUpdates()

  const [lnNoAmountInvoiceCreate] = useMutation.lnNoAmountInvoiceCreate()
  const [lnInvoiceCreate] = useMutation.lnInvoiceCreate()
  const [generateBtcAddress] = useMutation.onChainAddressCurrent()

  const updateInvoice = useCallback(
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
    [lnInvoiceCreate, lnNoAmountInvoiceCreate],
  )

  const updateBtcAddress = useCallback(
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
    [generateBtcAddress],
  )

  const toggleAmountCurrency = () => {
    if (amountCurrency === "USD") {
      setAmountCurrency("BTC")
    }
    if (amountCurrency === "BTC") {
      setAmountCurrency("USD")
      setUsdAmount(
        convertCurrencyAmount({
          amount: satAmount,
          from: "BTC",
          to: "USD",
        }),
      )
    }
  }

  useEffect((): void | (() => void) => {
    if (btcWalletId && !invoice && !showAmountInput && !showMemoInput) {
      if (paymentLayer === TYPE_LIGHTNING_BTC) {
        updateInvoice({ walletId: btcWalletId, satAmount, memo })
      }
      if (paymentLayer === TYPE_BITCOIN_ONCHAIN && !btcAddress) {
        updateBtcAddress({ walletId: btcWalletId })
      }
    }
  }, [
    btcAddress,
    btcWalletId,
    invoice,
    memo,
    paymentLayer,
    satAmount,
    showAmountInput,
    showMemoInput,
    updateBtcAddress,
    updateInvoice,
  ])

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
    copyPaymentInfoToClipboard(paymentFullUri)
    toastShow({
      message: translate("ReceiveBitcoinScreen.copyClipboard"),
      type: "success",
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

  const satAmountInUsd = convertCurrencyAmount({
    amount: satAmount,
    from: "BTC",
    to: "USD",
  })

  if (showAmountInput) {
    const usdAmountInSats = Math.round(
      convertCurrencyAmount({
        amount: usdAmount ?? 0,
        from: "USD",
        to: "BTC",
      }),
    )

    const validAmount =
      (amountCurrency === "BTC" && satAmount !== null) ||
      (amountCurrency === "USD" && usdAmount !== null)

    return (
      <View style={[styles.inputForm, styles.container]}>
        <View style={styles.currencyInputContainer}>
          <View style={styles.currencyInput}>
            {amountCurrency === "BTC" && (
              <>
                <FakeCurrencyInput
                  value={satAmount}
                  onChangeValue={(newValue) => setSatAmount(newValue)}
                  prefix=""
                  delimiter=","
                  separator="."
                  precision={0}
                  suffix=" sats"
                  minValue={0}
                  style={styles.walletBalanceInput}
                  autoFocus
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
            {amountCurrency === "USD" && (
              <>
                <FakeCurrencyInput
                  value={usdAmount}
                  onChangeValue={(newValue) => setUsdAmount(newValue)}
                  prefix="$"
                  delimiter=","
                  separator="."
                  precision={2}
                  style={styles.walletBalanceInput}
                  minValue={0}
                  autoFocus
                />
                <FakeCurrencyInput
                  value={usdAmountInSats}
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

        <Button
          title={translate("Update Invoice")}
          buttonStyle={[styles.button, styles.activeButtonStyle]}
          titleStyle={styles.activeButtonTitleStyle}
          disabledStyle={[styles.button, styles.disabledButtonStyle]}
          disabledTitleStyle={styles.disabledButtonTitleStyle}
          disabled={!validAmount}
          onPress={() => {
            if (amountCurrency === "USD" && usdAmount) {
              setSatAmount(usdAmountInSats)
            }
            setShowAmountInput(false)
            setInvoice(null)
          }}
        />
      </View>
    )
  }

  if (showMemoInput) {
    return (
      <View style={styles.inputForm}>
        <View style={styles.container}>
          <Text style={styles.fieldTitleText}>{translate("SendBitcoinScreen.note")}</Text>
          <View style={styles.field}>
            <TextInput
              style={styles.noteInput}
              placeholder={translate("SendBitcoinScreen.note")}
              onChangeText={(note) => setMemo(note)}
              value={memo}
              multiline={true}
              numberOfLines={3}
              autoFocus
            />
          </View>

          <Button
            title={translate("Update Invoice")}
            buttonStyle={[styles.button, styles.activeButtonStyle]}
            titleStyle={styles.activeButtonTitleStyle}
            onPress={() => {
              setShowMemoInput(false)
              setInvoice(null)
            }}
          />
        </View>
      </View>
    )
  }

  const displayAmount = () => {
    if (!satAmount) {
      return (
        <Text style={styles.primaryAmount}>{translate("Flexible Amount Invoice")}</Text>
      )
    }
    return (
      <>
        <Text style={styles.primaryAmount}>{satAmountDisplay(satAmount)}</Text>
        <Text style={styles.convertedAmount}>
          &#8776; {usdAmountDisplay(satAmountInUsd)}
        </Text>
      </>
    )
  }

  const invoiceReady = paymentDestination && !loading

  return (
    <KeyboardAwareScrollView>
      <View style={styles.container}>
        <Pressable onPress={copyToClipboard}>
          <QRView
            data={paymentDestination}
            type={paymentLayer}
            amount={satAmount}
            memo={memo}
            loading={!invoiceReady}
            completed={paymentLayer === TYPE_LIGHTNING_BTC ? invoicePaid : false}
            err={err}
          />
        </Pressable>
        <View style={styles.textContainer}>
          {invoiceReady ? (
            <>
              <View style={styles.copyInvoiceContainer}>
                <Pressable onPress={copyToClipboard}>
                  <Text style={styles.infoText}>
                    <Icon style={styles.infoText} name="copy-outline" />
                    <Text> </Text>
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
                    <Icon style={styles.infoText} name="share-outline" />
                    <Text> </Text>
                    {translate(
                      paymentLayer === TYPE_LIGHTNING_BTC
                        ? "ReceiveBitcoinScreen.shareInvoice"
                        : "Share Address",
                    )}
                  </Text>
                </Pressable>
              </View>
            </>
          ) : (
            <Text>{translate("Generating Invoice...")}</Text>
          )}
        </View>

        <View style={styles.invoiceInfo}>{displayAmount()}</View>

        <View style={styles.optionsContainer}>
          {!showAmountInput && (
            <View style={styles.field}>
              <Pressable onPress={() => setShowAmountInput(true)}>
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

          {!showMemoInput && (
            <View style={styles.field}>
              <Pressable onPress={() => setShowMemoInput(true)}>
                <View style={styles.fieldContainer}>
                  <View style={styles.fieldIconContainer}>
                    <NoteIcon />
                  </View>
                  <View style={styles.fieldTextContainer}>
                    <Text style={styles.fieldText}>{translate("Set a note/label")}</Text>
                  </View>
                  <View style={styles.fieldArrowContainer}>
                    <ChevronIcon />
                  </View>
                </View>
              </Pressable>
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
