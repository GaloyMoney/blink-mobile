import moment from "moment"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Alert, AppState, Pressable, Share, TextInput, View } from "react-native"
import { FakeCurrencyInput } from "react-native-currency-input"
import EStyleSheet from "react-native-extended-stylesheet"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import Icon from "react-native-vector-icons/Ionicons"

import { gql } from "@apollo/client"
import CalculatorIcon from "@app/assets/icons/calculator.svg"
import ChevronIcon from "@app/assets/icons/chevron.svg"
import NoteIcon from "@app/assets/icons/note.svg"
import {
  LnInvoice,
  LnNoAmountInvoice,
  useLnNoAmountInvoiceCreateMutation,
  useLnUsdInvoiceCreateMutation,
  useReceiveUsdQuery,
  WalletCurrency,
} from "@app/graphql/generated"
import { useCountdownTimer } from "@app/hooks"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { useI18nContext } from "@app/i18n/i18n-react"
import { palette } from "@app/theme"
import { logGeneratePaymentRequest } from "@app/utils/analytics"
import { testProps } from "@app/utils/testProps"
import { toastShow } from "@app/utils/toast"
import { getFullUri, TYPE_LIGHTNING_USD } from "@app/utils/wallet"
import { Network as NetworkLibGaloy, parsingv2 } from "@galoymoney/client"
import Clipboard from "@react-native-clipboard/clipboard"
import crashlytics from "@react-native-firebase/crashlytics"
import { Button, Text } from "@rneui/base"

import QRView from "./qr-view"
import { useLnUpdateHashPaid } from "@app/graphql/ln-update-context"
import { useIsAuthed } from "@app/graphql/is-authed-context"

const { decodeInvoiceString, getLightningInvoiceExpiryTime } = parsingv2

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
      id
      defaultAccount {
        id
        usdWallet @client {
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

  const { data } = useReceiveUsdQuery({ skip: !useIsAuthed() })
  const walletId = data?.me?.defaultAccount?.usdWallet?.id
  const network = data?.globals?.network

  const [invoice, setInvoice] = useState<LnInvoice | LnNoAmountInvoice | null>(null)
  const [usdAmount, setUsdAmount] = useState(0)
  const [memo, setMemo] = useState("")

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
    if (usdAmount > 0 && invoice) {
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

  const lastHash = useLnUpdateHashPaid()
  useEffect(() => {
    if (lastHash === invoice?.paymentHash) {
      setStatus("paid")
    }
  }, [invoice?.paymentHash, lastHash])

  const updateInvoice = useCallback(
    async ({
      walletId,
      usdAmount,
      memo,
    }: {
      walletId: string
      usdAmount: number
      memo: string
    }) => {
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
            setErr(LL.ReceiveWrapperScreen.error())
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
          const amountInCents = Math.round(usdAmount * 100)
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
            setErr(LL.ReceiveWrapperScreen.error())
            setStatus("error")
            return
          }
          invoice && setInvoice(invoice)
        }
        setStatus("active")
      } catch (err) {
        if (err instanceof Error) {
          crashlytics().recordError(err)
        }
        console.error(err, "error with AddInvoice")
        setStatus("error")
        setErr(`${err}`)
        throw err
      }
    },
    [lnNoAmountInvoiceCreate, lnUsdInvoiceCreate, LL],
  )

  useEffect(() => {
    if (walletId && !showAmountInput && !showMemoInput) {
      updateInvoice({ walletId, usdAmount, memo })
    }
  }, [usdAmount, memo, updateInvoice, walletId, showAmountInput, showMemoInput])

  useEffect(() => {
    if (status === "expired") {
      setErr(LL.ReceiveWrapperScreen.expired())
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
        message: (translations) => translations.ReceiveWrapperScreen.copyClipboard(),
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
      } catch (err) {
        if (err instanceof Error) {
          crashlytics().recordError(err)
          Alert.alert(err.message)
        }
      }
    }
  }, [paymentFullUri])
  if (showAmountInput) {
    return (
      <View style={styles.inputForm}>
        <View style={styles.container}>
          <Text style={styles.fieldTitleText}>
            {LL.ReceiveWrapperScreen.invoiceAmount()}
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
            title={LL.ReceiveWrapperScreen.updateInvoice()}
            buttonStyle={[styles.button, styles.activeButtonStyle]}
            titleStyle={styles.activeButtonTitleStyle}
            disabledStyle={[styles.button, styles.disabledButtonStyle]}
            disabledTitleStyle={styles.disabledButtonTitleStyle}
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
            title={LL.ReceiveWrapperScreen.updateInvoice()}
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
          {LL.ReceiveWrapperScreen.flexibleAmountInvoice()}
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
                  <Text>{LL.ReceiveWrapperScreen.generatingInvoice()}</Text>
                ) : (
                  <>
                    <View style={styles.copyInvoiceContainer}>
                      <Pressable
                        {...testProps(LL.ReceiveWrapperScreen.copyInvoice())}
                        onPress={copyToClipboard}
                      >
                        <Text style={styles.infoText}>
                          <Icon style={styles.infoText} name="copy-outline" />
                          <Text> </Text>
                          {LL.ReceiveWrapperScreen.copyInvoice()}
                        </Text>
                      </Pressable>
                    </View>
                    <View style={styles.shareInvoiceContainer}>
                      <Pressable
                        {...testProps(LL.ReceiveWrapperScreen.shareInvoice())}
                        onPress={share}
                      >
                        <Text style={styles.infoText}>
                          <Icon style={styles.infoText} name="share-outline" />
                          <Text> </Text>
                          {LL.ReceiveWrapperScreen.shareInvoice()}
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
              {LL.ReceiveWrapperScreen.expired()}
            </Text>
            <Button
              title={LL.ReceiveWrapperScreen.generatingInvoice()}
              buttonStyle={[styles.button, styles.activeButtonStyle]}
              titleStyle={styles.activeButtonTitleStyle}
              onPress={() => {
                setStatus("loading")
                walletId && updateInvoice({ walletId, usdAmount, memo })
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
                          {LL.ReceiveWrapperScreen.addAmount()}
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
                          {LL.ReceiveWrapperScreen.setANote()}
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
                    {LL.ReceiveWrapperScreen.expiresIn()}:{" "}
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
