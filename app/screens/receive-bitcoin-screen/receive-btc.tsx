import React, { useEffect, useMemo, useState } from "react"
import { Alert, Pressable, Share, TextInput, View } from "react-native"
import Icon from "react-native-vector-icons/Ionicons"

import { gql } from "@apollo/client"
import CalculatorIcon from "@app/assets/icons/calculator.svg"
import ChainIcon from "@app/assets/icons/chain.svg"
import ChevronIcon from "@app/assets/icons/chevron.svg"
import NoteIcon from "@app/assets/icons/note.svg"
import { useReceiveBtcQuery, WalletCurrency } from "@app/graphql/generated"
import { usePriceConversion } from "@app/hooks"
import { useI18nContext } from "@app/i18n/i18n-react"
import { testProps } from "@app/utils/testProps"
import { toastShow } from "@app/utils/toast"
import Clipboard from "@react-native-clipboard/clipboard"
import crashlytics from "@react-native-firebase/crashlytics"

import { AmountInputModal } from "@app/components/amount-input"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import {
  DisplayCurrency,
  isNonZeroMoneyAmount,
  MoneyAmount,
  WalletOrDisplayCurrency,
} from "@app/types/amounts"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { makeStyles, Text, useTheme } from "@rneui/themed"
import ReactNativeHapticFeedback from "react-native-haptic-feedback"
import { PaymentRequest } from "./payment-requests/index.types"
import QRView from "./qr-view"
import { useReceiveBitcoin } from "./use-payment-request"
import { PaymentRequestState } from "./use-payment-request.types"
import { useLevel } from "@app/graphql/level-context"
import { UpgradeAccountModal } from "@app/components/upgrade-account-modal"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"

const useStyles = makeStyles(({ colors }) => ({
  container: {
    marginTop: 14,
    marginLeft: 20,
    marginRight: 20,
  },
  field: {
    padding: 10,
    backgroundColor: colors.grey5,
    borderRadius: 10,
    marginBottom: 12,
  },
  inputForm: {
    marginVertical: 20,
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
  noteInput: {
    color: colors.black,
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
    fontSize: 14,
  },
  button: {
    height: 60,
    borderRadius: 10,
    marginTop: 40,
  },
  invoiceInfo: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 14,
  },
  fieldTitleText: {
    marginBottom: 5,
  },
  primaryAmount: {
    fontWeight: "bold",
    color: colors.black,
  },
}))

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
  const { formatDisplayAndWalletAmount, zeroDisplayAmount } = useDisplayCurrency()

  const {
    theme: { colors },
  } = useTheme()
  const styles = useStyles()

  const { isAtLeastLevelOne } = useLevel()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const closeUpgradeModal = () => setShowUpgradeModal(false)
  const openUpgradeModal = () => setShowUpgradeModal(true)
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
      zeroDisplayAmount &&
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
          unitOfAccountAmount: zeroDisplayAmount,
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
    zeroDisplayAmount,
  ])

  const { copyToClipboard, share } = useMemo(() => {
    if (!paymentRequest) {
      return {}
    }

    const paymentFullUri = paymentRequest.getFullUri({})

    const copyToClipboard = () => {
      Clipboard.setString(paymentFullUri)

      toastShow({
        message: (translations) =>
          paymentRequest.paymentRequestData?.paymentRequestType ===
          PaymentRequest.Lightning
            ? translations.ReceiveWrapperScreen.copyClipboard()
            : translations.ReceiveWrapperScreen.copyClipboardBitcoin(),
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

  const onSetAmount = (amount: MoneyAmount<WalletOrDisplayCurrency>) => {
    setAmount({ amount, generatePaymentRequestAfter: true })
    setShowAmountInput(false)
  }
  const closeAmountInput = () => {
    setShowAmountInput(false)
  }

  if (showAmountInput && unitOfAccountAmount) {
    return (
      <AmountInputModal
        moneyAmount={unitOfAccountAmount}
        walletCurrency={WalletCurrency.Btc}
        onSetAmount={onSetAmount}
        convertMoneyAmount={convertMoneyAmount}
        isOpen={showAmountInput}
        close={closeAmountInput}
      />
    )
  }

  if (showMemoInput) {
    return (
      <View style={[styles.container, styles.inputForm]}>
        <Text bold={true} type={"p2"} style={styles.fieldTitleText}>
          {LL.SendBitcoinScreen.note()}
        </Text>
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

        <GaloyPrimaryButton
          {...testProps(LL.ReceiveWrapperScreen.updateInvoice())}
          title={LL.ReceiveWrapperScreen.updateInvoice()}
          onPress={() => {
            setShowMemoInput(false)
            generatePaymentRequest && generatePaymentRequest()
          }}
          disabled={!memo}
        />
      </View>
    )
  }

  const amountInfo = () => {
    if (isNonZeroMoneyAmount(settlementAmount) && unitOfAccountAmount) {
      return (
        <Text {...testProps("btc-payment-amount")} style={styles.primaryAmount}>
          {formatDisplayAndWalletAmount({
            displayAmount: convertMoneyAmount(unitOfAccountAmount, DisplayCurrency),
            walletAmount: settlementAmount,
          })}
        </Text>
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
    <>
      <UpgradeAccountModal isVisible={showUpgradeModal} closeModal={closeUpgradeModal} />
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
                  <Text color={colors.grey2}>
                    <Icon color={colors.grey2} name="copy-outline" />
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
                  <Text color={colors.grey2}>
                    <Icon color={colors.grey2} name="share-outline" />
                    <Text> </Text>
                    {paymentRequestType === PaymentRequest.Lightning
                      ? LL.ReceiveWrapperScreen.shareInvoice()
                      : LL.ReceiveWrapperScreen.shareAddress()}
                  </Text>
                </Pressable>
              </View>
            </>
          ) : state === PaymentRequestState.Loading ? (
            <Text color={colors.grey2}>
              {`${LL.ReceiveWrapperScreen.generatingInvoice()}...`}
            </Text>
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
                <Pressable
                  onPress={
                    isAtLeastLevelOne ? togglePaymentRequestType : openUpgradeModal
                  }
                >
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
            <GaloyPrimaryButton
              title={LL.common.backHome()}
              onPress={navigation.popToTop}
            />
          </View>
        )}
      </View>
    </>
  )
}

export default ReceiveBtc
