import React, { useState } from "react"
import { ActivityIndicator, TouchableOpacity, View } from "react-native"

import { gql } from "@apollo/client"
import { GaloyIcon } from "@app/components/atomic/galoy-icon"
import GaloySliderButton from "@app/components/atomic/galoy-slider-button/galoy-slider-button"
import { PaymentDestinationDisplay } from "@app/components/payment-destination-display"
import { Screen } from "@app/components/screen"
import {
  useSendBitcoinConfirmationScreenQuery,
  WalletCurrency,
} from "@app/graphql/generated"
import { useHideAmount } from "@app/graphql/hide-amount-context"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { getBtcWallet, getUsdWallet } from "@app/graphql/wallets-utils"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import {
  addMoneyAmounts,
  DisplayCurrency,
  greaterThan,
  lessThanOrEqualTo,
  moneyAmountIsCurrencyType,
  multiplyMoneyAmounts,
  toBtcMoneyAmount,
  toUsdMoneyAmount,
  ZeroUsdMoneyAmount,
} from "@app/types/amounts"
import { logPaymentAttempt } from "@app/utils/analytics"
import { toastShow } from "@app/utils/toast"
import Clipboard from "@react-native-clipboard/clipboard"
import { RouteProp, useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { makeStyles, Text, useTheme } from "@rneui/themed"

import { testProps } from "../../utils/testProps"
import useFee from "./use-fee"

gql`
  query sendBitcoinConfirmationScreen {
    me {
      id
      defaultAccount {
        id
        wallets {
          id
          balance
          walletCurrency
        }
      }
    }
  }
`

type Props = { route: RouteProp<RootStackParamList, "sendBitcoinConfirmation"> }

const SendBitcoinConfirmationScreen: React.FC<Props> = ({ route }) => {
  const {
    theme: { colors },
  } = useTheme()
  const styles = useStyles()

  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "sendBitcoinConfirmation">>()

  const { hideAmount } = useHideAmount()

  const { paymentDetail } = route.params

  const {
    destination,
    paymentType,
    sendingWalletDescriptor,
    getFee,
    settlementAmount,
    memo: note,
    unitOfAccountAmount,
    convertMoneyAmount,
    isSendingMax,
  } = paymentDetail

  const [sliderSlid, setSliderSlid] = useState(false)

  const { formatDisplayAndWalletAmount } = useDisplayCurrency()

  const { data } = useSendBitcoinConfirmationScreenQuery({ skip: !useIsAuthed() })

  const btcWallet = getBtcWallet(data?.me?.defaultAccount?.wallets)
  const usdWallet = getUsdWallet(data?.me?.defaultAccount?.wallets)

  const btcBalanceMoneyAmount = toBtcMoneyAmount(btcWallet?.balance)

  const usdBalanceMoneyAmount = toUsdMoneyAmount(usdWallet?.balance)

  const btcWalletText = formatDisplayAndWalletAmount({
    displayAmount: convertMoneyAmount(btcBalanceMoneyAmount, DisplayCurrency),
    walletAmount: btcBalanceMoneyAmount,
  })

  const usdWalletText = formatDisplayAndWalletAmount({
    displayAmount: convertMoneyAmount(usdBalanceMoneyAmount, DisplayCurrency),
    walletAmount: usdBalanceMoneyAmount,
  })

  const [paymentError, _setPaymentError] = useState<string | undefined>(undefined)
  const { LL } = useI18nContext()

  const fee = useFee(getFee)

  let feeDisplayText = ""
  if (fee.amount) {
    const feeDisplayAmount = paymentDetail.convertMoneyAmount(fee.amount, DisplayCurrency)
    feeDisplayText = formatDisplayAndWalletAmount({
      displayAmount: feeDisplayAmount,
      walletAmount: fee.amount,
    })
  } else {
    feeDisplayText = LL.SendBitcoinConfirmationScreen.feeError()
  }

  const handleSendPayment = React.useCallback(async () => {
    if (sliderSlid || !sendingWalletDescriptor?.currency) {
      return
    }

    logPaymentAttempt({
      paymentType: paymentDetail.paymentType,
      sendingWallet: sendingWalletDescriptor.currency,
    })

    navigation.reset({
      routes: [
        { name: "Primary" },
        {
          name: "sendBitcoinPayment",
          params: {
            paymentDetail,
          },
        },
      ],
    })

    setSliderSlid(true)
  }, [sliderSlid, sendingWalletDescriptor.currency, paymentDetail, navigation])

  let validAmount = true
  let invalidAmountErrorMessage = ""

  const totalAmount = addMoneyAmounts({
    a: settlementAmount,
    b: fee.amount || ZeroUsdMoneyAmount,
  })

  if (
    moneyAmountIsCurrencyType(settlementAmount, WalletCurrency.Btc) &&
    btcBalanceMoneyAmount &&
    !isSendingMax
  ) {
    validAmount = lessThanOrEqualTo({
      value: totalAmount,
      lessThanOrEqualTo: btcBalanceMoneyAmount,
    })
    if (!validAmount) {
      invalidAmountErrorMessage = LL.SendBitcoinScreen.amountExceed({
        balance: btcWalletText,
      })
    }
  }

  if (
    moneyAmountIsCurrencyType(settlementAmount, WalletCurrency.Usd) &&
    usdBalanceMoneyAmount &&
    !isSendingMax
  ) {
    validAmount = lessThanOrEqualTo({
      value: totalAmount,
      lessThanOrEqualTo: usdBalanceMoneyAmount,
    })
    if (!validAmount) {
      invalidAmountErrorMessage = LL.SendBitcoinScreen.amountExceed({
        balance: usdWalletText,
      })
    }
  }

  const copyToClipboard = () => {
    Clipboard.setString(destination)
    toastShow({
      type: "success",
      message: LL.SendBitcoinConfirmationScreen.copiedDestination(),
      LL,
    })
  }

  const errorMessage = paymentError || invalidAmountErrorMessage

  const displayAmount = convertMoneyAmount(settlementAmount, DisplayCurrency)

  const transactionType = () => {
    if (paymentType === "intraledger") return LL.common.intraledger()
    if (paymentType === "onchain") return LL.common.onchain()
    if (paymentType === "lightning") return LL.common.lightning()
    if (paymentType === "lnurl") return LL.common.lightning()
  }

  const isLightningRecommended = () => {
    const ratioFeeToAmount = 50 // 2%

    if (!fee.amount) return false

    const feeMultiplied = multiplyMoneyAmounts({
      value: fee.amount,
      multiplier: ratioFeeToAmount,
    })

    if (
      paymentType === "onchain" &&
      greaterThan({ value: feeMultiplied, greaterThan: totalAmount })
    )
      return true
    return false
  }

  const LightningRecommendedComponent = isLightningRecommended() ? (
    <View style={styles.feeWarning}>
      <GaloyIcon name="warning" size={18} color={colors.warning} />
      <Text
        type="p3"
        style={styles.feeWarningText}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {" "}
        {LL.SendBitcoinConfirmationScreen.lightningRecommended()}
      </Text>
    </View>
  ) : (
    <></>
  )

  return (
    <Screen preset="scroll" style={styles.screenStyle} keyboardOffset="navigationHeader">
      <View style={styles.sendBitcoinConfirmationContainer}>
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldTitleText}>
            {LL.SendBitcoinScreen.destination()} - {transactionType()}
          </Text>
          <View style={styles.fieldBackground}>
            <PaymentDestinationDisplay
              destination={destination}
              paymentType={paymentType}
            />
            <TouchableOpacity
              style={styles.iconContainer}
              onPress={copyToClipboard}
              hitSlop={30}
            >
              <GaloyIcon name={"copy-paste"} size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldTitleText}>{LL.common.from()}</Text>
          <View style={styles.fieldBackground}>
            <View style={styles.walletSelectorTypeContainer}>
              <View
                style={
                  sendingWalletDescriptor.currency === WalletCurrency.Btc
                    ? styles.walletSelectorTypeLabelBitcoin
                    : styles.walletSelectorTypeLabelUsd
                }
              >
                {sendingWalletDescriptor.currency === WalletCurrency.Btc ? (
                  <Text style={styles.walletSelectorTypeLabelBtcText}>BTC</Text>
                ) : (
                  <Text style={styles.walletSelectorTypeLabelUsdText}>USD</Text>
                )}
              </View>
            </View>
            <View style={styles.walletSelectorInfoContainer}>
              <View style={styles.walletSelectorTypeTextContainer}>
                {sendingWalletDescriptor.currency === WalletCurrency.Btc ? (
                  <Text style={styles.walletCurrencyText}>{LL.common.btcAccount()}</Text>
                ) : (
                  <Text style={styles.walletCurrencyText}>{LL.common.usdAccount()}</Text>
                )}
              </View>
              <View style={styles.walletSelectorBalanceContainer}>
                <Text>
                  {hideAmount
                    ? "****"
                    : sendingWalletDescriptor.currency === WalletCurrency.Btc
                    ? btcWalletText
                    : usdWalletText}
                </Text>
              </View>
              <View />
            </View>
          </View>
        </View>
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldTitleText}>{LL.SendBitcoinScreen.amount()}</Text>
          <View style={styles.fieldBackground}>
            <Text type="p2">
              {formatDisplayAndWalletAmount({
                primaryAmount: unitOfAccountAmount,
                displayAmount,
                walletAmount: settlementAmount,
              })}
            </Text>
          </View>
        </View>
        {note ? (
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldTitleText}>{LL.SendBitcoinScreen.note()}</Text>
            <View style={styles.fieldBackground}>
              <Text type="p2" style={styles.noteText}>
                {note}
              </Text>
            </View>
          </View>
        ) : null}
        <View style={styles.fieldContainer}>
          <View style={styles.feeTextContainer}>
            <Text style={styles.fieldTitleText}>
              {LL.SendBitcoinConfirmationScreen.feeLabel()}
            </Text>
            {LightningRecommendedComponent}
          </View>
          <View
            style={[
              styles.fieldBackground,
              isLightningRecommended() ? styles.warningOutline : undefined,
            ]}
          >
            {fee.status === "loading" && <ActivityIndicator />}
            {fee.status === "set" && (
              <Text type="p2" {...testProps("Successful Fee")}>
                {feeDisplayText}
              </Text>
            )}
            {fee.status === "error" && Boolean(fee.amount) && (
              <Text type="p2">{feeDisplayText} *</Text>
            )}
            {fee.status === "error" && !fee.amount && (
              <Text type="p2">{LL.SendBitcoinConfirmationScreen.feeError()}</Text>
            )}
          </View>
          {fee.status === "error" && Boolean(fee.amount) && (
            <Text type="p2" style={styles.maxFeeWarningText}>
              {"*" + LL.SendBitcoinConfirmationScreen.maxFeeSelected()}
            </Text>
          )}
        </View>

        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text type="p2" style={styles.errorText}>
              {errorMessage}
            </Text>
          </View>
        ) : null}
        <View style={styles.buttonContainer}>
          <GaloySliderButton
            isLoading={sliderSlid}
            initialText={LL.SendBitcoinConfirmationScreen.slideToConfirm()}
            loadingText={LL.SendBitcoinConfirmationScreen.slideConfirming()}
            onSwipe={handleSendPayment}
            disabled={!validAmount || sliderSlid}
          />
        </View>
      </View>
    </Screen>
  )
}

export default SendBitcoinConfirmationScreen

const useStyles = makeStyles(({ colors }) => ({
  sendBitcoinConfirmationContainer: {
    flex: 1,
  },
  fieldContainer: {
    marginBottom: 12,
  },
  noteText: {
    flex: 1,
  },
  fieldBackground: {
    flexDirection: "row",
    borderStyle: "solid",
    overflow: "hidden",
    backgroundColor: colors.grey5,
    padding: 14,
    minHeight: 60,
    borderRadius: 10,
    alignItems: "center",
  },
  warningOutline: {
    borderColor: colors.warning,
    borderWidth: 2,
  },
  fieldTitleText: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  walletSelectorTypeContainer: {
    justifyContent: "center",
    alignItems: "flex-start",
    width: 50,
    marginRight: 20,
  },
  walletSelectorTypeLabelBitcoin: {
    height: 30,
    width: 50,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  walletSelectorTypeLabelUsd: {
    height: 30,
    width: 50,
    backgroundColor: colors._green,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  walletSelectorTypeLabelUsdText: {
    fontWeight: "bold",
    color: colors.black,
  },
  walletSelectorTypeLabelBtcText: {
    fontWeight: "bold",
    color: colors.white,
  },
  walletSelectorInfoContainer: {
    flex: 1,
    flexDirection: "column",
  },
  walletSelectorTypeTextContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  walletCurrencyText: {
    fontWeight: "bold",
    fontSize: 18,
  },
  walletSelectorBalanceContainer: {
    flex: 1,
    flexDirection: "row",
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  errorContainer: {
    marginVertical: 20,
    flex: 1,
  },
  errorText: {
    color: colors.error,
    textAlign: "center",
  },
  maxFeeWarningText: {
    color: colors.warning,
    fontWeight: "bold",
  },
  noteIconContainer: {
    marginRight: 12,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  noteIcon: {
    justifyContent: "center",
    alignItems: "center",
  },
  screenStyle: {
    padding: 20,
    flexGrow: 1,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "flex-start",
    paddingLeft: 20,
  },
  feeWarning: {
    paddingBottom: 4,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flex: 0.95,
  },
  feeWarningText: {
    color: colors.warning,
  },
  feeTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
}))
