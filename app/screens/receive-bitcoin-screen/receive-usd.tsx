import moment from "moment"
import React, { useEffect, useMemo, useState } from "react"
import { Alert, Pressable, Share, TextInput, View } from "react-native"
import { FakeCurrencyInput } from "react-native-currency-input"
import EStyleSheet from "react-native-extended-stylesheet"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import Icon from "react-native-vector-icons/Ionicons"

import { gql } from "@apollo/client"
import CalculatorIcon from "@app/assets/icons/calculator.svg"
import ChevronIcon from "@app/assets/icons/chevron.svg"
import NoteIcon from "@app/assets/icons/note.svg"
import { useReceiveUsdQuery, WalletCurrency } from "@app/graphql/generated"
import { usePriceConversion } from "@app/hooks"
import { useI18nContext } from "@app/i18n/i18n-react"
import { palette } from "@app/theme"
import { testProps } from "@app/utils/testProps"
import { toastShow } from "@app/utils/toast"
import { TYPE_LIGHTNING_USD } from "@app/screens/receive-bitcoin-screen/invoices/helpers"
import Clipboard from "@react-native-clipboard/clipboard"
import crashlytics from "@react-native-firebase/crashlytics"
import { Button, Text } from "@rneui/base"

import QRView from "./qr-view"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { InvoiceType } from "./invoices/index.types"
import { useReceiveBitcoin } from "./use-receive-bitcoin"
import {
  paymentAmountToDollarsOrSats,
  paymentAmountToTextWithUnits,
} from "@app/utils/currencyConversion"
import { ReceiveBitcoinState } from "./use-receive-bitcoin.types"
import { TranslationFunctions } from "@app/i18n/i18n-types"

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
`

const ReceiveUsd = () => {
  const [showMemoInput, setShowMemoInput] = useState(false)
  const [showAmountInput, setShowAmountInput] = useState(false)
  const { data } = useReceiveUsdQuery({ skip: !useIsAuthed() })

  const usdWalletId = data?.me?.defaultAccount?.usdWallet?.id
  const network = data?.globals?.network
  const {
    invoiceState,
    setAmount,
    generateInvoiceWithParams,
    setMemo,
    generateInvoice,
    checkExpiredAndGetRemainingSeconds,
  } = useReceiveBitcoin({})

  const { invoiceDetails, state, createInvoiceDetailsParams, invoice } = invoiceState

  const { LL } = useI18nContext()
  const { convertPaymentAmount: _convertPaymentAmount } = usePriceConversion()
  // setErr(LL.ReceiveWrapperScreen.expired())

  // initialize useReceiveBitcoin hook
  useEffect(() => {
    if (!createInvoiceDetailsParams && network && usdWalletId) {
      generateInvoiceWithParams({
        bitcoinNetwork: network,
        receivingWalletDescriptor: {
          currency: WalletCurrency.Usd,
          id: usdWalletId,
        },
        convertPaymentAmount: _convertPaymentAmount,
        invoiceType: InvoiceType.Lightning,
      })
    }
  }, [
    createInvoiceDetailsParams,
    generateInvoiceWithParams,
    network,
    usdWalletId,
    _convertPaymentAmount,
  ])

  const { copyToClipboard, share } = useMemo(() => {
    if (!invoice) {
      return {}
    }

    const paymentFullUri = invoice.getFullUri({})

    const copyToClipboard = () => {
      Clipboard.setString(paymentFullUri)

      toastShow({
        message: (translations) => translations.ReceiveWrapperScreen.copyClipboard(),
        currentTranslation: LL,
        type: "success",
      })
    }

    const share = async () => {
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

    return {
      copyToClipboard,
      share,
    }
  }, [invoice, LL])

  if (!invoiceDetails || !setAmount) {
    return <></>
  }

  const { unitOfAccountAmount, memo } = invoiceDetails

  const setAmountsWithUsd = (dollars: number | null) => {
    setAmount({
      amount: Math.round(Number(dollars) * 100),
      currency: WalletCurrency.Usd,
    })
  }

  if (showAmountInput && unitOfAccountAmount) {
    return (
      <View style={styles.inputForm}>
        <View style={styles.container}>
          <Text style={styles.fieldTitleText}>
            {LL.ReceiveWrapperScreen.invoiceAmount()}
          </Text>
          <View style={styles.field}>
            <FakeCurrencyInput
              value={paymentAmountToDollarsOrSats(unitOfAccountAmount)}
              onChangeValue={setAmountsWithUsd}
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
            onPress={() => {
              setShowAmountInput(false)
              generateInvoice && generateInvoice()
            }}
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
            onPress={() => {
              setShowMemoInput(false)
              generateInvoice && generateInvoice()
            }}
          />
        </View>
      </View>
    )
  }

  const displayAmount = () => {
    if (!unitOfAccountAmount?.amount) {
      return (
        <Text style={styles.primaryAmount}>
          {LL.ReceiveWrapperScreen.flexibleAmountInvoice()}
        </Text>
      )
    }
    return (
      <>
        <Text style={styles.primaryAmount}>
          {paymentAmountToTextWithUnits(unitOfAccountAmount)}
        </Text>
      </>
    )
  }

  let errorMessage = ""
  if (state === ReceiveBitcoinState.Expired) {
    errorMessage = LL.ReceiveWrapperScreen.expired()
  } else if (state === ReceiveBitcoinState.Error) {
    errorMessage = LL.ReceiveWrapperScreen.error()
  }

  return (
    <KeyboardAwareScrollView>
      <View style={styles.container}>
        {state !== ReceiveBitcoinState.Expired && (
          <>
            <Pressable onPress={copyToClipboard}>
              <QRView
                type={TYPE_LIGHTNING_USD}
                getFullUri={invoice?.getFullUri}
                loading={state === ReceiveBitcoinState.LoadingInvoice}
                completed={state === ReceiveBitcoinState.Paid}
                err={errorMessage}
              />
            </Pressable>

            <>
              <View style={styles.textContainer}>
                {state === ReceiveBitcoinState.LoadingInvoice ||
                !share ||
                !copyToClipboard ? (
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

        {state === ReceiveBitcoinState.Expired ? (
          <View style={[styles.container, styles.invoiceExpired]}>
            <Text style={styles.invoiceExpiredMessage}>
              {LL.ReceiveWrapperScreen.expired()}
            </Text>
            <Button
              title={LL.ReceiveWrapperScreen.regenerateInvoice()}
              buttonStyle={[styles.button, styles.activeButtonStyle]}
              titleStyle={styles.activeButtonTitleStyle}
              onPress={() => {
                generateInvoice && generateInvoice()
              }}
            />
          </View>
        ) : (
          <></>
        )}

        {state !== ReceiveBitcoinState.Paid && (
          <>
            <View style={styles.optionsContainer}>
              {!showAmountInput && (
                <View style={styles.field}>
                  <Pressable
                    onPress={() => {
                      setAmount({
                        amount: 0,
                        currency: WalletCurrency.Usd,
                      })
                      setShowAmountInput(true)
                    }}
                  >
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
            </View>
            <TimeInformation
              checkExpiredAndGetRemainingSeconds={checkExpiredAndGetRemainingSeconds}
              LL={LL}
            />
          </>
        )}
      </View>
    </KeyboardAwareScrollView>
  )
}

type TimeInformationParams = {
  checkExpiredAndGetRemainingSeconds:
    | ((currentTime: Date) => number | undefined)
    | undefined
  LL: TranslationFunctions
}

const TimeInformation = ({
  checkExpiredAndGetRemainingSeconds,
  LL,
}: TimeInformationParams) => {
  const [timeLeft, setTimeLeft] = useState<undefined | number>(undefined)

  // update time left every second
  useEffect(() => {
    const updateTimeLeft = () => {
      const newTimeLeft =
        checkExpiredAndGetRemainingSeconds &&
        checkExpiredAndGetRemainingSeconds(new Date())
      if (newTimeLeft !== timeLeft) {
        setTimeLeft(newTimeLeft)
      }
    }
    const interval = setInterval(() => {
      updateTimeLeft()
    }, 1000)
    updateTimeLeft()
    return () => clearInterval(interval)
  }, [checkExpiredAndGetRemainingSeconds, setTimeLeft, timeLeft])

  if (typeof timeLeft !== "number") {
    return <></>
  }

  return (
    <View style={styles.countdownTimer}>
      <Text style={timeLeft < 10 ? styles.lowTimer : undefined}>
        {LL.ReceiveWrapperScreen.expiresIn()}:{" "}
        {moment.utc(timeLeft * 1000).format("m:ss")}
      </Text>
    </View>
  )
}

export default ReceiveUsd
