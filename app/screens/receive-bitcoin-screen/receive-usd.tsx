import { PaymentDestinationDisplay } from "@app/components/payment-destination-display"
import { useMySubscription } from "@app/hooks"
import useMainQuery from "@app/hooks/use-main-query"
import { palette } from "@app/theme"
import { getFullUri, TYPE_LIGHTNING_USD } from "@app/utils/wallet"
import { GaloyGQL, translateUnknown as translate, useMutation } from "@galoymoney/client"
import React, { useCallback, useEffect, useState } from "react"
import { ActivityIndicator, Alert, Pressable, Share, TextInput, View } from "react-native"
import { Button, Text } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import QRView from "./qr-view"
import Icon from "react-native-vector-icons/Ionicons"
import Clipboard from "@react-native-community/clipboard"
import { FakeCurrencyInput } from "react-native-currency-input"
import { CountdownCircleTimer } from "react-native-countdown-circle-timer"
import Toast from "react-native-toast-message"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { usdAmountDisplay } from "@app/utils/currencyConversion"

import CalculatorIcon from "@app/assets/icons/calculator.svg"
import ChevronIcon from "@app/assets/icons/chevron.svg"
import NoteIcon from "@app/assets/icons/note.svg"

const styles = EStyleSheet.create({
  fieldsContainer: {
    marginTop: "20rem",
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

  invoiceDisplay: {
    padding: 15,
    backgroundColor: palette.white,
    borderRadius: 10,
  },
  infoText: {
    color: palette.midGrey,
    fontSize: "15rem",
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
    marginTop: 10,
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
    marginHorizontal: 20,
    marginTop: 5,
  },
  primaryAmount: {
    fontWeight: "bold",
  },
  fieldTitleText: {
    fontWeight: "bold",
    color: palette.lapisLazuli,
    marginBottom: 5,
  },
})

const ReceiveUsd = () => {
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState("")
  const [lnNoAmountInvoiceCreate] = useMutation.lnNoAmountInvoiceCreate()
  const [lnUsdInvoiceCreate] = useMutation.lnUsdInvoiceCreate()
  const { usdWalletId } = useMainQuery()
  const [invoice, setInvoice] = useState<
    GaloyGQL.LnInvoice | GaloyGQL.LnNoAmountInvoice | null
  >(null)
  const [usdAmount, setUsdAmount] = useState(0)
  const [memo, setMemo] = useState("")
  const { lnUpdate } = useMySubscription()
  const [showMemoInput, setShowMemoInput] = useState(false)
  const [showAmountInput, setShowAmountInput] = useState(false)

  const updateInvoice = useCallback(
    async ({ walletId, usdAmount, memo }) => {
      setLoading(true)
      try {
        if (usdAmount === 0) {
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
              lnUsdInvoiceCreate: { invoice, errors },
            },
          } = await lnUsdInvoiceCreate({
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
    [lnNoAmountInvoiceCreate, lnUsdInvoiceCreate],
  )

  useEffect((): void | (() => void) => {
    if (usdWalletId && !showAmountInput && !showMemoInput) {
      updateInvoice({ walletId: usdWalletId, usdAmount, memo })
    }
  }, [usdAmount, memo, updateInvoice, usdWalletId, showAmountInput, showMemoInput])

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
  }, [invoice?.paymentRequest])

  const copyToClipboard = () => {
    Clipboard.setString(getFullUri({ input: invoice?.paymentRequest, prefix: false }))
    Toast.show({
      type: "info",
      text1: translate("ReceiveBitcoinScreen.copyClipboard"),
      position: "bottom",
      bottomOffset: 80,
    })
  }

  if (showAmountInput) {
    return (
      <View style={styles.inputForm}>
        <View style={styles.fieldsContainer}>
          <Text style={styles.fieldTitleText}>{translate("Invoice Amount")}</Text>
          <View style={styles.field}>
            <FakeCurrencyInput
              value={usdAmount}
              onChangeValue={(newValue) => setUsdAmount(newValue ?? 0)}
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
            title={translate("Update Invoice")}
            buttonStyle={[styles.button, styles.activeButtonStyle]}
            titleStyle={styles.activeButtonTitleStyle}
            onPress={() => setShowAmountInput(false)}
          />
        </View>
      </View>
    )
  }

  if (showMemoInput) {
    return (
      <View style={styles.inputForm}>
        <View style={styles.fieldsContainer}>
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
            onPress={() => setShowMemoInput(false)}
          />
        </View>
      </View>
    )
  }

  const displayAmount = () => {
    if (!usdAmount) {
      return undefined
    }
    return (
      <>
        <Text style={styles.primaryAmount}>{usdAmountDisplay(usdAmount)}</Text>
      </>
    )
  }

  return (
    <KeyboardAwareScrollView>
      <Pressable onPress={copyToClipboard}>
        <QRView
          data={invoice?.paymentRequest}
          type={TYPE_LIGHTNING_USD}
          amount={usdAmount}
          memo={memo}
          loading={loading}
          completed={invoicePaid}
          err={err}
        />
      </Pressable>

      <View style={styles.invoiceInfo}>{displayAmount()}</View>

      <View style={styles.fieldsContainer}>
        <View style={styles.invoiceDisplay}>
          {!loading && <PaymentDestinationDisplay data={invoice?.paymentRequest} />}
          {loading && <ActivityIndicator />}
        </View>

        <View style={styles.textContainer}>
          <View style={styles.copyInvoiceContainer}>
            <Pressable onPress={copyToClipboard}>
              <Text style={styles.infoText}>
                <Icon style={styles.infoText} name="copy-outline" />{" "}
                {translate("ReceiveBitcoinScreen.copyInvoice")}
              </Text>
            </Pressable>
          </View>
          <View style={styles.shareInvoiceContainer}>
            <Pressable onPress={share}>
              <Text style={styles.infoText}>
                <Icon style={styles.infoText} name="share-outline" />{" "}
                {translate("ReceiveBitcoinScreen.shareInvoice")}
              </Text>
            </Pressable>
          </View>
        </View>

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
        </View>

        {invoice?.paymentRequest && Boolean(usdAmount) && (
          <View style={styles.countdownTimerContainer}>
            <CountdownCircleTimer
              key={invoice?.paymentRequest}
              isPlaying
              duration={120}
              colors={"#004777"}
              size={80}
              onComplete={() => {
                updateInvoice({ walletId: usdWalletId, usdAmount, memo })
              }}
            >
              {({ remainingTime }) => <Text>{remainingTime}</Text>}
            </CountdownCircleTimer>
          </View>
        )}
      </View>
    </KeyboardAwareScrollView>
  )
}

export default ReceiveUsd
