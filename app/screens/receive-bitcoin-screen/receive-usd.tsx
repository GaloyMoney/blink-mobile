import { useMutation } from "@apollo/client"
import LightningInvoice from "@app/components/lightning-invoice/lightning-invoice"
import { useMySubscription } from "@app/hooks"
import useMainQuery from "@app/hooks/use-main-query"
import { palette } from "@app/theme"
import { getFullUri, TYPE_LIGHTNING_USD } from "@app/utils/wallet"
import { translateUnknown as translate } from "@galoymoney/client"
import debounce from "lodash.debounce"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Share,
  View,
} from "react-native"
import { Text } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { ADD_NO_AMOUNT_INVOICE, ADD_USD_INVOICE } from "./gql"
import { QRView } from "./qr-view"
import Icon from "react-native-vector-icons/Ionicons"
import Clipboard from "@react-native-community/clipboard"
import CalculatorIcon from "@app/assets/icons/calculator.svg"
import ChevronIcon from "@app/assets/icons/chevron.svg"
import { FakeCurrencyInput } from "react-native-currency-input"
import { ScrollView } from "react-native-gesture-handler"
import { CountdownCircleTimer } from "react-native-countdown-circle-timer"

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
    justifyContent: "center",
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
  amountInput: {
    color: palette.lapisLazuli,
    fontSize: 20,
    fontWeight: "600",
  },
  countdownTimerContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: "20rem",
  },
})
const ReceiveUsd = ({ navigation }) => {
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState("")
  const [addNoAmountInvoice] = useMutation(ADD_NO_AMOUNT_INVOICE)
  const [addUsdInvoice] = useMutation(ADD_USD_INVOICE)
  const { usdWalletId } = useMainQuery()
  const [invoice, setInvoice] = useState<{
    paymentHash: string
    paymentRequest: string
  } | null>(null)
  const [usdAmount, setUsdAmount] = useState(0)
  const [memo, setMemo] = useState("")
  const { lnUpdate } = useMySubscription()
  const [isAmountless, setIsAmountless] = useState(true)
  const updateInvoice = useMemo(
    () =>
      debounce(
        async ({ walletId, usdAmount, memo }) => {
          setLoading(true)
          try {
            if (usdAmount === 0) {
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
                  lnUsdInvoiceCreate: { invoice, errors },
                },
              } = await addUsdInvoice({
                variables: {
                  input: { walletId, amount: parseFloat(usdAmount) * 100, memo },
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
    [addNoAmountInvoice, addUsdInvoice],
  )

  useEffect((): void | (() => void) => {
    if (usdWalletId) {
      updateInvoice({ walletId: usdWalletId, usdAmount, memo })
      return () => updateInvoice.cancel()
    }
  }, [usdAmount, memo, updateInvoice, usdWalletId])

  const invoicePaid =
    lnUpdate?.paymentHash === invoice?.paymentHash && lnUpdate?.status === "PAID"

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
  }, [invoice?.paymentRequest, getFullUri])

  return (
    <ScrollView>
      <QRView
        data={invoice?.paymentRequest}
        type={TYPE_LIGHTNING_USD}
        amount={usdAmount}
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
          <View style={styles.field}>
            {isAmountless && (
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
            )}
            {!isAmountless && (
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : null}
                keyboardVerticalOffset={Platform.select({ ios: 0, android: 500 })}
              >
                <FakeCurrencyInput
                  value={usdAmount}
                  onChangeValue={setUsdAmount}
                  prefix="$"
                  delimiter=","
                  separator="."
                  precision={2}
                  suffix=""
                  minValue={0}
                  style={styles.amountInput}
                />
              </KeyboardAvoidingView>
            )}
          </View>
        </View>
        {!isAmountless && invoice?.paymentRequest && !!usdAmount && (
          <View style={styles.countdownTimerContainer}>
            <CountdownCircleTimer
              key={invoice?.paymentRequest}
              isPlaying
              duration={120}
              colors={"#004777"}
              size={80}
              onComplete={() => updateInvoice({ walletId: usdWalletId, usdAmount, memo })}
            >
              {({ remainingTime }) => <Text>{remainingTime}</Text>}
            </CountdownCircleTimer>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

export default ReceiveUsd
