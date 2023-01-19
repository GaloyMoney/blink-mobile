import { useCountdownTimer, useSubscriptionUpdates } from "@app/hooks"
import { palette } from "@app/theme"
import { TYPE_LIGHTNING_USD, getFullUri } from "@app/utils/wallet"
import { parsingv2, Network as NetworkLibGaloy } from "@galoymoney/client"
const { decodeInvoiceString, getLightningInvoiceExpiryTime } = parsingv2

import CalculatorIcon from "@app/assets/icons/calculator.svg"
import ChevronIcon from "@app/assets/icons/chevron.svg"
import NoteIcon from "@app/assets/icons/note.svg"
import {
  LnInvoice,
  LnNoAmountInvoice,
  WalletCurrency,
  useLnNoAmountInvoiceCreateMutation,
  useLnUsdInvoiceCreateMutation,
  useReceiveUsdQuery,
} from "@app/graphql/generated"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { useI18nContext } from "@app/i18n/i18n-react"
import { logGeneratePaymentRequest } from "@app/utils/analytics"
import Clipboard from "@react-native-community/clipboard"
import { toastShow } from "@app/utils/toast"
import crashlytics from "@react-native-firebase/crashlytics"
import { Button, Text } from "@rneui/base"
import moment from "moment"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Alert, AppState, Pressable, Share, TextInput, View } from "react-native"
import { FakeCurrencyInput } from "react-native-currency-input"
import EStyleSheet from "react-native-extended-stylesheet"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import Icon from "react-native-vector-icons/Ionicons"
import QRView from "./qr-view"

import { gql } from "@apollo/client"

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

gql`
  query receiveUsd {
    globals {
      network
    }
    me {
      defaultAccount {
        usdWallet {
          id
        }
      }
    }
  }

  mutation lnUsdInvoiceCreate($input: LnUsdInvoiceCreateInput!) {
    lnUsdInvoiceCreate(input: $input) {
      errors {
        message
      }
      invoice {
        paymentHash
        paymentRequest
        paymentSecret
        satoshis
      }
    }
  }
`

const ReceiveUsd = () => {
  const appState = useRef(AppState.currentState)
  const [status, setStatus] = useState<
    "loading" | "active" | "expired" | "error" | "paid"
  >("loading")
  const [err, setErr] = useState("")
  const [lnNoAmountInvoiceCreate] = useLnNoAmountInvoiceCreateMutation()
  const [lnUsdInvoiceCreate] = useLnUsdInvoiceCreateMutation()

  const { data } = useReceiveUsdQuery({ fetchPolicy: "cache-only" })
  const walletId = data?.me?.defaultAccount?.usdWallet?.id
  const network = data?.globals?.network

  const [invoice, setInvoice] = useState<LnInvoice | LnNoAmountInvoice | null>(null)
  const [usdAmount, setUsdAmount] = useState(0)
  const [memo, setMemo] = useState("")

  // FIXME: we should subscribe at the root level, so we receive update even if we're not on the receive screen
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
              decodeInvoiceString(invoice.paymentRequest, network as NetworkLibGaloy),
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
    if (usdAmount && usdAmount > 0 && invoice) {
      const callback = () => {
        setStatus("expired")
      }
      const timeUntilInvoiceExpires =
        getLightningInvoiceExpiryTime(
          decodeInvoiceString(invoice.paymentRequest, network as NetworkLibGaloy),
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
            receivingWallet: WalletCurrency.Usd,
          })
          const { data } = await lnNoAmountInvoiceCreate({
            variables: { input: { walletId, memo } },
          })

          if (!data) {
            throw new Error("lnNoAmountInvoiceCreate returned no data")
          }

          const {
            lnNoAmountInvoiceCreate: { invoice, errors },
          } = data

          if (errors && errors.length !== 0) {
            console.error(errors, "error with lnNoAmountInvoiceCreate")
            setErr(LL.ReceiveBitcoinScreen.error())
            setStatus("error")
            return
          }

          invoice && setInvoice(invoice)
        } else {
          logGeneratePaymentRequest({
            paymentType: "lightning",
            hasAmount: true,
            receivingWallet: WalletCurrency.Usd,
          })
          const amountInCents = Math.round(parseFloat(usdAmount) * 100)
          const { data } = await lnUsdInvoiceCreate({
            variables: {
              input: { walletId, amount: amountInCents, memo },
            },
          })

          if (!data) {
            throw new Error("lnUsdInvoiceCreate returned no data")
          }

          const {
            lnUsdInvoiceCreate: { invoice, errors },
          } = data

          if (errors && errors.length !== 0) {
            console.error(errors, "error with lnInvoiceCreate")
            setErr(LL.ReceiveBitcoinScreen.error())
            setStatus("error")
            return
          }
          invoice && setInvoice(invoice)
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
    if (walletId && !showAmountInput && !showMemoInput) {
      updateInvoice({ walletId, usdAmount, memo })
    }
  }, [usdAmount, memo, updateInvoice, walletId, showAmountInput, showMemoInput])

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

  const paymentRequest = invoice?.paymentRequest
  const paymentFullUri =
    paymentRequest && getFullUri({ input: paymentRequest, prefix: false })

  const copyToClipboard = useMemo(() => {
    if (!paymentFullUri) {
      return null
    }

    return () => {
      Clipboard.setString(paymentFullUri)

      toastShow({
        message: (translations) => translations.ReceiveBitcoinScreen.copyClipboard(),
        currentTranslation: LL,
        type: "success",
      })
    }
  }, [paymentFullUri, LL])

  const share = useMemo(() => {
    if (!paymentFullUri) {
      return null
    }

    return async () => {
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
        crashlytics().recordError(error)
        Alert.alert(error.message)
      }
    }
  }, [paymentFullUri])
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
              onChangeValue={(newValue) => setUsdAmount(Number(newValue))}
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
                data={invoice?.paymentRequest || ""}
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
                {loading || !share || !copyToClipboard ? (
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
                updateInvoice({ walletId, usdAmount, memo })
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
              {timeLeft && (
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
