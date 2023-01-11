import { useSubscriptionUpdates, useCountdownTimer } from "@app/hooks"
import useMainQuery from "@app/hooks/use-main-query"
import { palette } from "@app/theme"
import { getFullUri, TYPE_LIGHTNING_USD } from "@app/utils/wallet"
import { parsingv2, GaloyGQL } from "@galoymoney/client"
const { decodeInvoiceString, getLightningInvoiceExpiryTime } = parsingv2

import React, { useCallback, useEffect, useRef, useState } from "react"
import { Alert, AppState, Pressable, Share, TextInput, View } from "react-native"
import { Button, Text } from "@rneui/base"
import EStyleSheet from "react-native-extended-stylesheet"
import QRView from "./qr-view"
import Icon from "react-native-vector-icons/Ionicons"
import { FakeCurrencyInput } from "react-native-currency-input"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import CalculatorIcon from "@app/assets/icons/calculator.svg"
import ChevronIcon from "@app/assets/icons/chevron.svg"
import NoteIcon from "@app/assets/icons/note.svg"
import { toastShow } from "@app/utils/toast"
import { copyPaymentInfoToClipboard } from "@app/utils/clipboard"
import moment from "moment"
import { useI18nContext } from "@app/i18n/i18n-react"
import { logGeneratePaymentRequest } from "@app/utils/analytics"
import { WalletCurrency } from "@app/types/amounts"
import crashlytics from "@react-native-firebase/crashlytics"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import {
  useLnNoAmountInvoiceCreateMutation,
  useLnUsdInvoiceCreateMutation,
} from "@app/graphql/generated"

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
  invoiceInfo: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 14,
  },
  invoiceExpired: {
    marginTop: 25,
  },
  invoiceExpiredMessage: {
    color: palette.red,
    fontSize: "20rem",
    textAlign: "center",
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
    fontSize: "14rem",
  },
  amountInput: {
    color: palette.lapisLazuli,
    fontSize: 20,
    fontWeight: "600",
  },
  button: {
    height: 60,
    borderRadius: 10,
    marginTop: 30,
  },
  activeButtonStyle: {
    backgroundColor: palette.lightBlue,
  },
  activeButtonTitleStyle: {
    color: palette.white,
    fontWeight: "bold",
  },
  primaryAmount: {
    fontWeight: "bold",
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
  lowTimer: {
    color: palette.red,
  },
  countdownTimer: {
    alignItems: "center",
  },
})

const ReceiveUsd = () => {
  const appState = useRef(AppState.currentState)
  const [status, setStatus] = useState<
    "loading" | "active" | "expired" | "error" | "paid"
  >("loading")
  const [err, setErr] = useState("")
  const [lnNoAmountInvoiceCreate] = useLnNoAmountInvoiceCreateMutation()
  const [lnUsdInvoiceCreate] = useLnUsdInvoiceCreateMutation()
  const { usdWalletId, network } = useMainQuery()
  const [invoice, setInvoice] = useState<
    GaloyGQL.LnInvoice | GaloyGQL.LnNoAmountInvoice | null
  >(null)
  const [usdAmount, setUsdAmount] = useState(0)
  const [memo, setMemo] = useState("")
  const { lnUpdate } = useSubscriptionUpdates()
  const [showMemoInput, setShowMemoInput] = useState(false)
  const [showAmountInput, setShowAmountInput] = useState(false)
  const { LL } = useI18nContext()
  const { timeLeft, startCountdownTimer, resetCountdownTimer, stopCountdownTimer } =
    useCountdownTimer()
  const { formatToDisplayCurrency } = useDisplayCurrency()

  useEffect(() => {
    if (invoice && usdAmount > 0) {
      const subscription = AppState.addEventListener("change", (nextAppState) => {
        if (appState.current.match(/inactive|background/) && nextAppState === "active") {
          const timeUntilInvoiceExpires =
            getLightningInvoiceExpiryTime(
              decodeInvoiceString(invoice.paymentRequest, network),
            ) - Math.round(Date.now() / 1000)
          if (timeUntilInvoiceExpires <= 0) {
            setStatus("expired")
            stopCountdownTimer()
          }
          resetCountdownTimer(timeUntilInvoiceExpires, () => setStatus("expired"))
        }
        appState.current = nextAppState
      })
      return () => {
        subscription.remove()
      }
    }
    return undefined
  }, [invoice, setStatus, stopCountdownTimer, resetCountdownTimer, usdAmount, network])

  useEffect(() => {
    if (usdAmount && usdAmount > 0) {
      const callback = () => {
        setStatus("expired")
      }
      const timeUntilInvoiceExpires =
        getLightningInvoiceExpiryTime(
          decodeInvoiceString(invoice.paymentRequest, network),
        ) - Math.round(Date.now() / 1000)
      if (timeUntilInvoiceExpires <= 0) {
        callback()
        return
      }
      startCountdownTimer(timeUntilInvoiceExpires, callback)
    }
  }, [usdAmount, invoice, network, startCountdownTimer])

  const updateInvoice = useCallback(
    async ({ walletId, usdAmount, memo }) => {
      setStatus("loading")
      try {
        if (usdAmount === 0) {
          logGeneratePaymentRequest({
            paymentType: "lightning",
            hasAmount: false,
            receivingWallet: WalletCurrency.USD,
          })
          const {
            data: {
              lnNoAmountInvoiceCreate: { invoice, errors },
            },
          } = await lnNoAmountInvoiceCreate({
            variables: { input: { walletId, memo } },
          })
          if (errors && errors.length !== 0) {
            console.error(errors, "error with lnNoAmountInvoiceCreate")
            setErr(LL.ReceiveBitcoinScreen.error())
            setStatus("error")
            return
          }
          setInvoice(invoice)
        } else {
          logGeneratePaymentRequest({
            paymentType: "lightning",
            hasAmount: true,
            receivingWallet: WalletCurrency.USD,
          })
          const amountInCents = Math.round(parseFloat(usdAmount) * 100)
          const {
            data: {
              lnUsdInvoiceCreate: { invoice, errors },
            },
          } = await lnUsdInvoiceCreate({
            variables: {
              input: { walletId, amount: amountInCents, memo },
            },
          })

          if (errors && errors.length !== 0) {
            console.error(errors, "error with lnInvoiceCreate")
            setErr(LL.ReceiveBitcoinScreen.error())
            setStatus("error")
            return
          }
          setInvoice(invoice)
        }
        setStatus("active")
      } catch (err) {
        crashlytics().recordError(err)
        console.error(err, "error with AddInvoice")
        setStatus("error")
        setErr(`${err}`)
        throw err
      }
    },
    [lnNoAmountInvoiceCreate, lnUsdInvoiceCreate, LL],
  )

  useEffect((): void | (() => void) => {
    if (usdWalletId && !showAmountInput && !showMemoInput) {
      updateInvoice({ walletId: usdWalletId, usdAmount, memo })
    }
  }, [usdAmount, memo, updateInvoice, usdWalletId, showAmountInput, showMemoInput])

  useEffect((): void | (() => void) => {
    if (lnUpdate?.paymentHash === invoice?.paymentHash && lnUpdate?.status === "PAID") {
      setStatus("paid")
    }
  }, [lnUpdate, invoice])

  useEffect((): void | (() => void) => {
    if (status === "expired") {
      setErr(LL.ReceiveBitcoinScreen.expired())
    } else if (status !== "error") {
      setErr("")
    }
  }, [status, LL])

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
      crashlytics().recordError(error)
      Alert.alert(error.message)
    }
  }, [invoice?.paymentRequest])

  const copyToClipboard = () => {
    copyPaymentInfoToClipboard(
      getFullUri({ input: invoice?.paymentRequest, prefix: false }),
    )
    toastShow({
      message: LL.ReceiveBitcoinScreen.copyClipboard(),
      type: "success",
    })
  }

  if (showAmountInput) {
    return (
      <View style={styles.inputForm}>
        <View style={styles.container}>
          <Text style={styles.fieldTitleText}>
            {LL.ReceiveBitcoinScreen.invoiceAmount()}
          </Text>
          <View style={styles.field}>
            <FakeCurrencyInput
              value={usdAmount}
              onChangeValue={(newValue) => setUsdAmount(newValue)}
              prefix="$"
              delimiter=","
              separator="."
              precision={2}
              suffix=""
              minValue={0}
              style={styles.amountInput}
              autoFocus
            />
          </View>

          <Button
            title={LL.ReceiveBitcoinScreen.updateInvoice()}
            buttonStyle={[styles.button, styles.activeButtonStyle]}
            titleStyle={styles.activeButtonTitleStyle}
            disabledStyle={[styles.button, styles.disabledButtonStyle]}
            disabledTitleStyle={styles.disabledButtonTitleStyle}
            disabled={usdAmount === null}
            onPress={() => setShowAmountInput(false)}
          />
        </View>
      </View>
    )
  }

  if (showMemoInput) {
    return (
      <View style={styles.inputForm}>
        <View style={styles.container}>
          <Text style={styles.fieldTitleText}>{LL.SendBitcoinScreen.note()}</Text>
          <View style={styles.field}>
            <TextInput
              style={styles.noteInput}
              placeholder={LL.SendBitcoinScreen.note()}
              onChangeText={(note) => setMemo(note)}
              value={memo}
              multiline={true}
              numberOfLines={3}
              autoFocus
            />
          </View>

          <Button
            title={LL.ReceiveBitcoinScreen.updateInvoice()}
            buttonStyle={[styles.button, styles.activeButtonStyle]}
            titleStyle={styles.activeButtonTitleStyle}
            onPress={() => setShowMemoInput(false)}
          />
        </View>
      </View>
    )
  }

  const displayAmount = () => {
    if (!usdAmount) {
      return (
        <Text style={styles.primaryAmount}>
          {LL.ReceiveBitcoinScreen.flexibleAmountInvoice()}
        </Text>
      )
    }
    return (
      <>
        <Text style={styles.primaryAmount}>{formatToDisplayCurrency(usdAmount)}</Text>
      </>
    )
  }

  const loading = status === "loading"

  return (
    <KeyboardAwareScrollView>
      <View style={styles.container}>
        {status !== "expired" && (
          <>
            <Pressable onPress={copyToClipboard}>
              <QRView
                data={invoice?.paymentRequest}
                type={TYPE_LIGHTNING_USD}
                amount={usdAmount}
                memo={memo}
                loading={loading}
                completed={status === "paid"}
                err={err}
              />
            </Pressable>

            <>
              <View style={styles.textContainer}>
                {loading ? (
                  <Text>{LL.ReceiveBitcoinScreen.generatingInvoice()}</Text>
                ) : (
                  <>
                    <View style={styles.copyInvoiceContainer}>
                      <Pressable onPress={copyToClipboard}>
                        <Text style={styles.infoText}>
                          <Icon style={styles.infoText} name="copy-outline" />
                          <Text> </Text>
                          {LL.ReceiveBitcoinScreen.copyInvoice()}
                        </Text>
                      </Pressable>
                    </View>
                    <View style={styles.shareInvoiceContainer}>
                      <Pressable onPress={share}>
                        <Text style={styles.infoText}>
                          <Icon style={styles.infoText} name="share-outline" />
                          <Text> </Text>
                          {LL.ReceiveBitcoinScreen.shareInvoice()}
                        </Text>
                      </Pressable>
                    </View>
                  </>
                )}
              </View>

              <View style={styles.invoiceInfo}>{displayAmount()}</View>
            </>
          </>
        )}

        {status === "expired" && (
          <View style={[styles.container, styles.invoiceExpired]}>
            <Text style={styles.invoiceExpiredMessage}>
              {LL.ReceiveBitcoinScreen.expired()}
            </Text>
            <Button
              title={LL.ReceiveBitcoinScreen.generatingInvoice()}
              buttonStyle={[styles.button, styles.activeButtonStyle]}
              titleStyle={styles.activeButtonTitleStyle}
              onPress={() => {
                setStatus("loading")
                updateInvoice({ walletId: usdWalletId, usdAmount, memo })
              }}
            />
          </View>
        )}

        {status === "active" && (
          <>
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
                          {LL.ReceiveBitcoinScreen.addAmount()}
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
                        <Text style={styles.fieldText}>
                          {LL.ReceiveBitcoinScreen.setANote()}
                        </Text>
                      </View>
                      <View style={styles.fieldArrowContainer}>
                        <ChevronIcon />
                      </View>
                    </View>
                  </Pressable>
                </View>
              )}
              {Boolean(timeLeft) && (
                <View style={styles.countdownTimer}>
                  <Text style={timeLeft < 10 ? styles.lowTimer : undefined}>
                    {LL.ReceiveBitcoinScreen.expiresIn()}:{" "}
                    {moment.utc(timeLeft * 1000).format("m:ss")}
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
      </View>
    </KeyboardAwareScrollView>
  )
}

export default ReceiveUsd
