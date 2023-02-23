import React, { useEffect, useMemo, useState } from "react"
import { Alert, Pressable, Share, TextInput, View } from "react-native"
import { FakeCurrencyInput } from "react-native-currency-input"
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
import {
  paymentAmountToDollarsOrSats,
  paymentAmountToTextWithUnits,
} from "@app/utils/currencyConversion"
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
import { BtcPaymentAmount } from "@app/types/amounts"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"

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
  const { fiatSymbol } = useDisplayCurrency()

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
  const { convertPaymentAmount: _convertPaymentAmount } = usePriceConversion()
  const { LL } = useI18nContext()

  // initialize useReceiveBitcoin hook
  useEffect(() => {
    if (
      !createPaymentRequestDetailsParams &&
      network &&
      btcWalletId &&
      // TODO: improve readability on when this function is available
      !isNaN(
        _convertPaymentAmount(
          { amount: 0, currency: WalletCurrency.Btc } as BtcPaymentAmount,
          WalletCurrency.Btc,
        ).amount,
      )
    ) {
      setCreatePaymentRequestDetailsParams(
        {
          bitcoinNetwork: network,
          receivingWalletDescriptor: {
            currency: WalletCurrency.Btc,
            id: btcWalletId,
          },
          convertPaymentAmount: _convertPaymentAmount,
          paymentRequestType: PaymentRequest.Lightning,
        },
        true,
      )
    }
  }, [
    createPaymentRequestDetailsParams,
    setCreatePaymentRequestDetailsParams,
    network,
    btcWalletId,
    _convertPaymentAmount,
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

  if (!paymentRequestDetails || !setAmount) {
    return <></>
  }

  const {
    unitOfAccountAmount,
    settlementAmount,
    convertPaymentAmount,
    memo,
    paymentRequestType,
  } = paymentRequestDetails

  const toggleAmountCurrency =
    unitOfAccountAmount &&
    (() => {
      const newAmountCurrency =
        unitOfAccountAmount.currency === WalletCurrency.Usd
          ? WalletCurrency.Btc
          : WalletCurrency.Usd
      setAmount(convertPaymentAmount(unitOfAccountAmount, newAmountCurrency))
    })
  const togglePaymentRequestType = () => {
    const newPaymentRequestType =
      paymentRequestDetails.paymentRequestType === PaymentRequest.Lightning
        ? PaymentRequest.OnChain
        : PaymentRequest.Lightning
    setPaymentRequestType(newPaymentRequestType, true)
  }
  const btcAmount = settlementAmount
  const usdAmount =
    unitOfAccountAmount && convertPaymentAmount(unitOfAccountAmount, WalletCurrency.Usd)
  const setAmountsWithBtc = (sats: number) => {
    setAmount({
      amount: sats,
      currency: WalletCurrency.Btc,
    })
  }
  const setAmountsWithUsd = (dollars: number | null) => {
    setAmount({
      amount: Math.round(Number(dollars) * 100),
      currency: WalletCurrency.Usd,
    })
  }

  if (showAmountInput && unitOfAccountAmount && btcAmount && usdAmount) {
    const validAmount = Boolean(paymentRequestDetails.unitOfAccountAmount.amount)

    return (
      <View style={[styles.inputForm, styles.container]}>
        <View style={styles.currencyInputContainer}>
          <View style={styles.currencyInput}>
            {unitOfAccountAmount.currency === WalletCurrency.Btc && (
              <>
                <FakeCurrencyInput
                  {...testProps("btc-unit-btc-amount-input")}
                  value={paymentAmountToDollarsOrSats(btcAmount)}
                  onChangeValue={(newValue) => setAmountsWithBtc(Number(newValue))}
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
                  {...testProps("btc-unit-usd-amount-input")}
                  value={paymentAmountToDollarsOrSats(usdAmount)}
                  prefix={fiatSymbol}
                  delimiter=","
                  separator="."
                  precision={2}
                  minValue={0}
                  editable={false}
                  style={styles.convertedAmountText}
                />
              </>
            )}
            {unitOfAccountAmount.currency === WalletCurrency.Usd && (
              <>
                <FakeCurrencyInput
                  {...testProps("usd-unit-usd-amount-input")}
                  value={paymentAmountToDollarsOrSats(usdAmount)}
                  onChangeValue={setAmountsWithUsd}
                  prefix={fiatSymbol}
                  delimiter=","
                  separator="."
                  precision={2}
                  style={styles.walletBalanceInput}
                  minValue={0}
                  autoFocus
                />
                <FakeCurrencyInput
                  {...testProps("usd-unit-btc-amount-input")}
                  value={paymentAmountToDollarsOrSats(btcAmount)}
                  prefix=""
                  delimiter=","
                  separator="."
                  suffix=" sats"
                  precision={0}
                  minValue={0}
                  editable={false}
                  style={styles.convertedAmountText}
                />
              </>
            )}
          </View>

          <View {...testProps("toggle-currency-button")} style={styles.toggle}>
            <Pressable onPress={toggleAmountCurrency}>
              <View style={styles.switchCurrencyIconContainer}>
                <SwitchIcon />
              </View>
            </Pressable>
          </View>
        </View>

        <Button
          {...testProps(LL.ReceiveWrapperScreen.updateInvoice())}
          title={LL.ReceiveWrapperScreen.updateInvoice()}
          buttonStyle={[styles.button, styles.activeButtonStyle]}
          titleStyle={styles.activeButtonTitleStyle}
          disabledStyle={[styles.button, styles.disabledButtonStyle]}
          disabledTitleStyle={styles.disabledButtonTitleStyle}
          disabled={!validAmount}
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
              onChangeText={(note) => setMemo(note)}
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

  const displayAmount = () => {
    if (!btcAmount || !usdAmount) {
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
      <>
        <Text {...testProps("btc-payment-amount")} style={styles.primaryAmount}>
          {paymentAmountToTextWithUnits(btcAmount)}
        </Text>
        <Text {...testProps("usd-payment-amount")} style={styles.convertedAmount}>
          &#8776; {paymentAmountToTextWithUnits(usdAmount)}
        </Text>
      </>
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
            <Text>{`${LL.ReceiveWrapperScreen.generatingInvoice()}...`}</Text>
          ) : null}
        </View>

        <View style={styles.invoiceInfo}>{displayAmount()}</View>
        <View style={styles.optionsContainer}>
          {!showAmountInput && (
            <View
              {...testProps(LL.ReceiveWrapperScreen.addAmount())}
              style={styles.field}
            >
              <Pressable
                onPress={() => {
                  setAmountsWithUsd(0)
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
            <View {...testProps(LL.ReceiveWrapperScreen.setANote())} style={styles.field}>
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
      </View>
    </KeyboardAwareScrollView>
  )
}

export default ReceiveBtc
