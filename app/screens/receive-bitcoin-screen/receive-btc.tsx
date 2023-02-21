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
import { useReceiveBitcoin } from "./use-receive-bitcoin"
import { ReceiveBitcoinState } from "./use-receive-bitcoin.types"
import { InvoiceType } from "./invoices/index.types"

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
  const [showMemoInput, setShowMemoInput] = useState(false)
  const [showAmountInput, setShowAmountInput] = useState(false)
  const {
    invoiceState,
    setAmount,
    generateInvoiceWithParams,
    setInvoiceType,
    setMemo,
    generateInvoice,
  } = useReceiveBitcoin({})

  const { invoiceDetails, state, createInvoiceDetailsParams, invoice } = invoiceState

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
    if (!createInvoiceDetailsParams && network && btcWalletId) {
      generateInvoiceWithParams({
        bitcoinNetwork: network,
        receivingWalletDescriptor: {
          currency: WalletCurrency.Btc,
          id: btcWalletId,
        },
        convertPaymentAmount: _convertPaymentAmount,
        invoiceType: InvoiceType.Lightning,
      })
    }
  }, [
    createInvoiceDetailsParams,
    generateInvoiceWithParams,
    network,
    btcWalletId,
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

  const {
    unitOfAccountAmount,
    settlementAmount,
    convertPaymentAmount,
    memo,
    invoiceType,
  } = invoiceDetails

  const toggleAmountCurrency =
    unitOfAccountAmount &&
    (() => {
      const newAmountCurrency =
        unitOfAccountAmount.currency === WalletCurrency.Usd
          ? WalletCurrency.Btc
          : WalletCurrency.Usd
      setAmount(convertPaymentAmount(unitOfAccountAmount, newAmountCurrency))
    })
  const toggleInvoiceType = () => {
    const newInvoiceType =
      invoiceDetails.invoiceType === InvoiceType.Lightning
        ? InvoiceType.OnChain
        : InvoiceType.Lightning
    setInvoiceType(newInvoiceType, true)
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
    const validAmount = Boolean(invoiceDetails.unitOfAccountAmount.amount)

    return (
      <View style={[styles.inputForm, styles.container]}>
        <View style={styles.currencyInputContainer}>
          <View style={styles.currencyInput}>
            {unitOfAccountAmount.currency === WalletCurrency.Btc && (
              <>
                <FakeCurrencyInput
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
                  value={paymentAmountToDollarsOrSats(usdAmount)}
                  prefix="$"
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
                  value={paymentAmountToDollarsOrSats(usdAmount)}
                  onChangeValue={setAmountsWithUsd}
                  prefix="$"
                  delimiter=","
                  separator="."
                  precision={2}
                  style={styles.walletBalanceInput}
                  minValue={0}
                  autoFocus
                />
                <FakeCurrencyInput
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

          <View style={styles.toggle}>
            <Pressable onPress={toggleAmountCurrency}>
              <View style={styles.switchCurrencyIconContainer}>
                <SwitchIcon />
              </View>
            </Pressable>
          </View>
        </View>

        <Button
          title={LL.ReceiveWrapperScreen.updateInvoice()}
          buttonStyle={[styles.button, styles.activeButtonStyle]}
          titleStyle={styles.activeButtonTitleStyle}
          disabledStyle={[styles.button, styles.disabledButtonStyle]}
          disabledTitleStyle={styles.disabledButtonTitleStyle}
          disabled={!validAmount}
          onPress={() => {
            generateInvoice && generateInvoice()
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
    if (!btcAmount || !usdAmount) {
      return (
        <Text style={styles.primaryAmount}>
          {LL.ReceiveWrapperScreen.flexibleAmountInvoice()}
        </Text>
      )
    }
    return (
      <>
        <Text style={styles.primaryAmount}>
          {paymentAmountToTextWithUnits(btcAmount)}
        </Text>
        <Text style={styles.convertedAmount}>
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
              invoiceDetails.invoiceType === InvoiceType.Lightning
                ? "LIGHTNING_BTC"
                : "BITCOIN_ONCHAIN"
            }
            getFullUri={invoice?.getFullUri}
            loading={state === ReceiveBitcoinState.LoadingInvoice}
            completed={state === ReceiveBitcoinState.Paid}
            err={
              invoiceState.state === ReceiveBitcoinState.Error
                ? LL.ReceiveWrapperScreen.error()
                : ""
            }
          />
        </Pressable>
        <View style={styles.textContainer}>
          {state === ReceiveBitcoinState.InvoiceCreated ? (
            <>
              <View style={styles.copyInvoiceContainer}>
                <Pressable
                  {...testProps(LL.ReceiveWrapperScreen.copyInvoice())}
                  onPress={copyToClipboard}
                >
                  <Text style={styles.infoText}>
                    <Icon style={styles.infoText} name="copy-outline" />
                    <Text> </Text>
                    {invoiceType === InvoiceType.Lightning
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
                    {invoiceType === InvoiceType.Lightning
                      ? LL.ReceiveWrapperScreen.shareInvoice()
                      : LL.ReceiveWrapperScreen.shareAddress()}
                  </Text>
                </Pressable>
              </View>
            </>
          ) : state === ReceiveBitcoinState.LoadingInvoice ? (
            <Text>{`${LL.ReceiveWrapperScreen.generatingInvoice()}...`}</Text>
          ) : null}
        </View>

        <View style={styles.invoiceInfo}>{displayAmount()}</View>
        <View style={styles.optionsContainer}>
          {!showAmountInput && (
            <View style={styles.field}>
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

          <View style={styles.field}>
            <Pressable onPress={toggleInvoiceType}>
              <View style={styles.fieldContainer}>
                <View style={styles.fieldIconContainer}>
                  <ChainIcon />
                </View>
                <View style={styles.fieldTextContainer}>
                  <Text style={styles.fieldText}>
                    {invoiceType === InvoiceType.Lightning
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
