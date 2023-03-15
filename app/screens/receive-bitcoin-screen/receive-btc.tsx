import React, { useEffect, useMemo, useState } from "react"
import { Alert, Pressable, Share, TextInput, View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import Icon from "react-native-vector-icons/Ionicons"

import { gql } from "@apollo/client"
import CalculatorIcon from "@app/assets/icons/calculator.svg"
import ChainIcon from "@app/assets/icons/chain.svg"
import ChevronIcon from "@app/assets/icons/chevron.svg"
import NoteIcon from "@app/assets/icons/note.svg"
import SwitchIcon from "@app/assets/icons/switch.svg"
import { useReceiveBtcQuery, WalletCurrency } from "@app/graphql/generated"
import { usePriceConversion } from "@app/hooks"
import { useI18nContext } from "@app/i18n/i18n-react"
import { palette } from "@app/theme"
import { testProps } from "@app/utils/testProps"
import { toastShow } from "@app/utils/toast"
import Clipboard from "@react-native-clipboard/clipboard"
import crashlytics from "@react-native-firebase/crashlytics"
import { Button, Text } from "@rneui/base"

import QRView from "./qr-view"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useReceiveBitcoin } from "./use-payment-request"
import { PaymentRequestState } from "./use-payment-request.types"
import { PaymentRequest } from "./payment-requests/index.types"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import {
  DisplayCurrency,
  isNonZeroMoneyAmount,
  ZeroDisplayAmount,
} from "@app/types/amounts"
import { StackNavigationProp } from "@react-navigation/stack"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { useNavigation } from "@react-navigation/native"
import ReactNativeHapticFeedback from "react-native-haptic-feedback"
import { MoneyAmountInput } from "@app/components/money-amount-input"

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
  fieldTitleText: {
    fontWeight: "bold",
    color: palette.lapisLazuli,
    marginBottom: 5,
  },
  disabledButtonStyle: {
    backgroundColor: palette.lightBlue,
    opacity: 0.5,
  },
  disabledButtonTitleStyle: {
    color: palette.lightGrey,
    fontWeight: "600",
  },
})

gql`
  query receiveBtc {
    globals {
      network
    }
    me {
      id
      defaultAccount {
        id
        btcWallet @client {
          id
        }
      }
    }
  }
`

const ReceiveBtc = () => {
  const { formatDisplayAndWalletAmount, getSecondaryAmountIfCurrencyIsDifferent } =
    useDisplayCurrency()

  const [showMemoInput, setShowMemoInput] = useState(false)
  const [showAmountInput, setShowAmountInput] = useState(false)
  const {
    state,
    paymentRequestDetails,
    createPaymentRequestDetailsParams,
    setCreatePaymentRequestDetailsParams,
    paymentRequest,
    setAmount,
    setMemo,
    generatePaymentRequest,
    setPaymentRequestType,
  } = useReceiveBitcoin({})

  const { data } = useReceiveBtcQuery({
    fetchPolicy: "cache-first",
    skip: !useIsAuthed(),
  })
  const network = data?.globals?.network
  const btcWalletId = data?.me?.defaultAccount?.btcWallet?.id
  const { convertMoneyAmount: _convertMoneyAmount } = usePriceConversion()
  const { LL } = useI18nContext()
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "receiveBitcoin">>()

  // initialize useReceiveBitcoin hook
  useEffect(() => {
    if (
      !createPaymentRequestDetailsParams &&
      network &&
      btcWalletId &&
      // TODO: improve readability on when this function is available
      _convertMoneyAmount
    ) {
      setCreatePaymentRequestDetailsParams({
        params: {
          bitcoinNetwork: network,
          receivingWalletDescriptor: {
            currency: WalletCurrency.Btc,
            id: btcWalletId,
          },
          unitOfAccountAmount: ZeroDisplayAmount,
          convertMoneyAmount: _convertMoneyAmount,
          paymentRequestType: PaymentRequest.Lightning,
        },
        generatePaymentRequestAfter: true,
      })
    }
  }, [
    createPaymentRequestDetailsParams,
    setCreatePaymentRequestDetailsParams,
    network,
    btcWalletId,
    _convertMoneyAmount,
  ])

  const { copyToClipboard, share } = useMemo(() => {
    if (!paymentRequest) {
      return {}
    }

    const paymentFullUri = paymentRequest.getFullUri({})

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
  }, [paymentRequest, LL])

  useEffect(() => {
    if (state === PaymentRequestState.Paid) {
      ReactNativeHapticFeedback.trigger("notificationSuccess", {
        ignoreAndroidSystemSettings: true,
      })
    } else if (state === PaymentRequestState.Error) {
      ReactNativeHapticFeedback.trigger("notificationError", {
        ignoreAndroidSystemSettings: true,
      })
    }
  }, [state])

  if (!paymentRequestDetails || !setAmount) {
    return <></>
  }

  const togglePaymentRequestType = () => {
    const newPaymentRequestType =
      paymentRequestDetails.paymentRequestType === PaymentRequest.Lightning
        ? PaymentRequest.OnChain
        : PaymentRequest.Lightning
    setPaymentRequestType({
      paymentRequestType: newPaymentRequestType,
      generatePaymentRequestAfter: true,
    })
  }

  const {
    unitOfAccountAmount,
    settlementAmount,
    convertMoneyAmount,
    memo,
    paymentRequestType,
  } = paymentRequestDetails

  if (showAmountInput && unitOfAccountAmount) {
    const displayAmount =
      unitOfAccountAmount && convertMoneyAmount(unitOfAccountAmount, DisplayCurrency)
    const secondaryAmount = getSecondaryAmountIfCurrencyIsDifferent({
      primaryAmount: unitOfAccountAmount,
      displayAmount,
      walletAmount: settlementAmount,
    })

    const toggleAmountCurrency = secondaryAmount
      ? () => {
          setAmount({ amount: secondaryAmount })
        }
      : undefined

    return (
      <View style={[styles.inputForm, styles.container]}>
        <View style={styles.currencyInputContainer}>
          <View style={styles.currencyInput}>
            <MoneyAmountInput
              {...testProps(`${unitOfAccountAmount.currency} Input`)}
              moneyAmount={unitOfAccountAmount}
              setAmount={(amount) =>
                setAmount({
                  amount,
                })
              }
              style={styles.walletBalanceInput}
            />
            {secondaryAmount && (
              <MoneyAmountInput
                {...testProps(`${secondaryAmount.currency} Input`)}
                moneyAmount={secondaryAmount}
                editable={false}
                style={styles.convertedAmountText}
              />
            )}
          </View>
          {toggleAmountCurrency && (
            <View {...testProps("toggle-currency-button")} style={styles.toggle}>
              <Pressable onPress={toggleAmountCurrency}>
                <View style={styles.switchCurrencyIconContainer}>
                  <SwitchIcon />
                </View>
              </Pressable>
            </View>
          )}
        </View>

        <Button
          {...testProps(LL.ReceiveWrapperScreen.updateInvoice())}
          title={LL.ReceiveWrapperScreen.updateInvoice()}
          buttonStyle={[styles.button, styles.activeButtonStyle]}
          titleStyle={styles.activeButtonTitleStyle}
          disabledStyle={[styles.button, styles.disabledButtonStyle]}
          disabledTitleStyle={styles.disabledButtonTitleStyle}
          onPress={() => {
            generatePaymentRequest && generatePaymentRequest()
            setShowAmountInput(false)
          }}
        />
      </View>
    )
  }

  if (showMemoInput) {
    return (
      <View style={styles.inputForm}>
        <View style={styles.container}>
          <Text style={styles.fieldTitleText}>{LL.SendBitcoinScreen.note()}</Text>
          <View {...testProps(LL.SendBitcoinScreen.note())} style={styles.field}>
            <TextInput
              style={styles.noteInput}
              placeholder={LL.SendBitcoinScreen.note()}
              onChangeText={(memo) =>
                setMemo({
                  memo,
                })
              }
              value={memo}
              multiline={true}
              numberOfLines={3}
              autoFocus
            />
          </View>

          <Button
            {...testProps(LL.ReceiveWrapperScreen.updateInvoice())}
            title={LL.ReceiveWrapperScreen.updateInvoice()}
            buttonStyle={[styles.button, styles.activeButtonStyle]}
            titleStyle={styles.activeButtonTitleStyle}
            onPress={() => {
              setShowMemoInput(false)
              generatePaymentRequest && generatePaymentRequest()
            }}
            disabled={!memo}
            disabledStyle={[styles.button, styles.disabledButtonStyle]}
            disabledTitleStyle={styles.disabledButtonTitleStyle}
          />
        </View>
      </View>
    )
  }

  const amountInfo = () => {
    if (isNonZeroMoneyAmount(settlementAmount) && unitOfAccountAmount) {
      return (
        <>
          <Text {...testProps("btc-payment-amount")}>
            {formatDisplayAndWalletAmount({
              displayAmount: convertMoneyAmount(unitOfAccountAmount, DisplayCurrency),
              walletAmount: settlementAmount,
            })}
          </Text>
        </>
      )
    }
    return (
      <Text
        {...testProps(LL.ReceiveWrapperScreen.flexibleAmountInvoice())}
        style={styles.primaryAmount}
      >
        {LL.ReceiveWrapperScreen.flexibleAmountInvoice()}
      </Text>
    )
  }

  return (
    <KeyboardAwareScrollView>
      <View style={styles.container}>
        <Pressable onPress={copyToClipboard}>
          <QRView
            type={
              paymentRequestDetails.paymentRequestType === PaymentRequest.Lightning
                ? "LIGHTNING_BTC"
                : "BITCOIN_ONCHAIN"
            }
            getFullUri={paymentRequest?.getFullUri}
            loading={state === PaymentRequestState.Loading}
            completed={state === PaymentRequestState.Paid}
            err={
              state === PaymentRequestState.Error ? LL.ReceiveWrapperScreen.error() : ""
            }
          />
        </Pressable>
        <View style={styles.textContainer}>
          {state === PaymentRequestState.Created ? (
            <>
              <View style={styles.copyInvoiceContainer}>
                <Pressable
                  {...testProps(LL.ReceiveWrapperScreen.copyInvoice())}
                  onPress={copyToClipboard}
                >
                  <Text style={styles.infoText}>
                    <Icon style={styles.infoText} name="copy-outline" />
                    <Text> </Text>
                    {paymentRequestType === PaymentRequest.Lightning
                      ? LL.ReceiveWrapperScreen.copyInvoice()
                      : LL.ReceiveWrapperScreen.copyAddress()}
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
                    {paymentRequestType === PaymentRequest.Lightning
                      ? LL.ReceiveWrapperScreen.shareInvoice()
                      : LL.ReceiveWrapperScreen.shareAddress()}
                  </Text>
                </Pressable>
              </View>
            </>
          ) : state === PaymentRequestState.Loading ? (
            <Text
              style={styles.infoText}
            >{`${LL.ReceiveWrapperScreen.generatingInvoice()}...`}</Text>
          ) : null}
        </View>

        {state === PaymentRequestState.Created && (
          <>
            <View style={styles.invoiceInfo}>{amountInfo()}</View>
            <View style={styles.optionsContainer}>
              {!showAmountInput && (
                <View
                  {...testProps(LL.ReceiveWrapperScreen.addAmount())}
                  style={styles.field}
                >
                  <Pressable
                    onPress={() => {
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
                <View
                  {...testProps(LL.ReceiveWrapperScreen.setANote())}
                  style={styles.field}
                >
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

              <View style={styles.field}>
                <Pressable onPress={togglePaymentRequestType}>
                  <View style={styles.fieldContainer}>
                    <View style={styles.fieldIconContainer}>
                      <ChainIcon />
                    </View>
                    <View style={styles.fieldTextContainer}>
                      <Text style={styles.fieldText}>
                        {paymentRequestType === PaymentRequest.Lightning
                          ? LL.ReceiveWrapperScreen.useABitcoinOnchainAddress()
                          : LL.ReceiveWrapperScreen.useALightningInvoice()}
                      </Text>
                    </View>
                    <View style={styles.fieldArrowContainer}>
                      <ChevronIcon />
                    </View>
                  </View>
                </Pressable>
              </View>
            </View>
          </>
        )}
        {state === PaymentRequestState.Paid && (
          <View style={styles.optionsContainer}>
            <Button
              title={LL.ReceiveWrapperScreen.regenerateInvoice()}
              buttonStyle={[styles.button, styles.activeButtonStyle]}
              titleStyle={styles.activeButtonTitleStyle}
              onPress={() => {
                generatePaymentRequest && generatePaymentRequest()
              }}
            />
            <Button
              title={LL.common.backHome()}
              buttonStyle={[styles.button, styles.activeButtonStyle]}
              titleStyle={styles.activeButtonTitleStyle}
              onPress={() => navigation.popToTop()}
            />
          </View>
        )}
      </View>
    </KeyboardAwareScrollView>
  )
}

export default ReceiveBtc
