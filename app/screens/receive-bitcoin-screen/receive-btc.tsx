import { useMutation } from "@apollo/client"
import LightningInvoice from "@app/components/lightning-invoice/lightning-invoice"
import { useMySubscription } from "@app/hooks"
import useMainQuery from "@app/hooks/use-main-query"
import { getFullUri, TYPE_LIGHTNING_BTC } from "@app/utils/wallet"
import { translateUnknown as translate } from "@galoymoney/client"
import Clipboard from "@react-native-community/clipboard"
import debounce from "lodash.debounce"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { ActivityIndicator, Alert, Pressable, Share, View } from "react-native"
import { Text } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { ScrollView } from "react-native-gesture-handler"
import { ADD_INVOICE, ADD_NO_AMOUNT_INVOICE } from "./gql"
import { QRView } from "./qr-view"
import Icon from "react-native-vector-icons/Ionicons"
import CalculatorIcon from "@app/assets/icons/calculator.svg"
import ChevronIcon from "@app/assets/icons/chevron.svg"
import { FakeCurrencyInput } from "react-native-currency-input"
import { palette } from "@app/theme"
import SwitchIcon from "@app/assets/icons/switch.svg"

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
  const [addNoAmountInvoice] = useMutation(ADD_NO_AMOUNT_INVOICE)
  const [addInvoice] = useMutation(ADD_INVOICE)
  const { btcWalletId } = useMainQuery()
  const [invoice, setInvoice] = useState<{
    paymentHash: string
    paymentRequest: string
  } | null>(null)
  const [satAmount, setSatAmount] = useState(0)
  const [satAmountInUsd, setSatAmountInUsd] = useState(0)
  const [memo] = useState("") // FIXME
  const { lnUpdate } = useMySubscription()
  const [isAmountless, setIsAmountless] = useState(true)
  const [amountCurrency, setAmountCurrency] = useState("USD")
  const { convertCurrencyAmount } = useMySubscription()
  const updateInvoice = useMemo(
    () =>
      debounce(
        async ({ walletId, satAmount, memo }) => {
          setLoading(true)
          try {
            if (satAmount === 0) {
              const {
                data: {
                  lnNoAmountInvoiceCreate: { invoice, errors },
                },
              } = await addNoAmountInvoice({
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
              } = await addInvoice({
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
    [addNoAmountInvoice, addInvoice],
  )

  const toggleAmountCurrency = () => {
    if (amountCurrency === "USD") {
      setAmountCurrency("BTC")
    }
    if (amountCurrency === "BTC") {
      setAmountCurrency("USD")
    }
  }

  const share = useCallback(async () => {
    try {
      const result = await Share.share({
        message: getFullUri({ input: invoice?.paymentRequest, prefix: false }),
      })

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
  }, [invoice?.paymentRequest])

  useEffect((): void | (() => void) => {
    if (btcWalletId) {
      updateInvoice({ walletId: btcWalletId, satAmount, memo })
      return () => updateInvoice.cancel()
    }
  }, [satAmount, memo, updateInvoice, btcWalletId])

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

  const invoicePaid =
    lnUpdate?.paymentHash === invoice?.paymentHash && lnUpdate?.status === "PAID"

  return (
    <ScrollView>
      <QRView
        data={invoice?.paymentRequest}
        type={TYPE_LIGHTNING_BTC}
        amount={satAmount}
        memo={memo}
        loading={loading}
        completed={invoicePaid}
        err={err}
      />
      <View style={styles.fieldsContainer}>
        <View style={styles.field}>
          {!loading && <LightningInvoice invoice={invoice?.paymentRequest} />}
          {loading && <ActivityIndicator />}
        </View>

        <View style={styles.textContainer}>
          <View style={styles.copyInvoiceContainer}>
            <Pressable
              onPress={() =>
                Clipboard.setString(
                  getFullUri({ input: invoice?.paymentRequest, prefix: false }),
                )
              }
            >
              <Text style={styles.infoText}>
                <Icon style={styles.infoText} name="copy-outline" />
                {translate("ReceiveBitcoinScreen.copyInvoice")}
              </Text>
            </Pressable>
          </View>
          <View style={styles.shareInvoiceContainer}>
            <Pressable onPress={share}>
              <Text style={styles.infoText}>
                <Icon style={styles.infoText} name="share-outline" />
                {translate("ReceiveBitcoinScreen.shareInvoice")}
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
                        editable={false}
                        style={styles.convertedAmountText}
                      />
                    </>
                  )}
                  {amountCurrency === "USD" && (
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
        </View>
      </View>
    </ScrollView>
  )
}

export default ReceiveBtc
