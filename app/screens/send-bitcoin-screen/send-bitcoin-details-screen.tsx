import React, { useEffect, useState } from "react"
import { View } from "react-native"
import { makeStyles } from "@rneui/themed"
import crashlytics from "@react-native-firebase/crashlytics"

// components
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"
import { SendBitcoinDetailsExtraInfo } from "./send-bitcoin-details-extra-info"
import { Screen } from "@app/components/screen"
import { Fees } from "@app/components/refund-flow"
import {
  ChooseWallet,
  DetailAmountNote,
  DetailDestination,
} from "@app/components/send-flow"

// gql
import {
  useSendBitcoinDetailsScreenQuery,
  useSendBitcoinInternalLimitsQuery,
  useSendBitcoinWithdrawalLimitsQuery,
  WalletCurrency,
} from "@app/graphql/generated"
import { decodeInvoiceString, Network as NetworkLibGaloy } from "@galoymoney/client"
import { getUsdWallet } from "@app/graphql/wallets-utils"

// hooks
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useLevel } from "@app/graphql/level-context"
import { useBreez, useIbexFee, usePriceConversion } from "@app/hooks"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { useI18nContext } from "@app/i18n/i18n-react"
import { usePersistentStateContext } from "@app/store/persistent-state"

// types
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { NavigationProp, RouteProp, useNavigation } from "@react-navigation/native"
import { PaymentDetail } from "./payment-details/index.types"
import { Satoshis } from "lnurl-pay/dist/types/types"

// utils
import { DisplayCurrency, toBtcMoneyAmount, toUsdMoneyAmount } from "@app/types/amounts"
import { isValidAmount } from "./payment-details"
import { requestInvoice, utils } from "lnurl-pay"
import { fetchBreezFee } from "@app/utils/breez-sdk-liquid"

type Props = {
  route: RouteProp<RootStackParamList, "sendBitcoinDetails">
}

const network = "mainnet" // data?.globals?.network

const SendBitcoinDetailsScreen: React.FC<Props> = ({ route }) => {
  const navigation =
    useNavigation<NavigationProp<RootStackParamList, "sendBitcoinDetails">>()
  const styles = useStyles()
  const { LL } = useI18nContext()
  const { currentLevel } = useLevel()
  const { btcWallet } = useBreez()
  const { persistentState } = usePersistentStateContext()
  const { convertMoneyAmount: _convertMoneyAmount } = usePriceConversion("network-only")
  const { zeroDisplayAmount, formatDisplayAndWalletAmount } = useDisplayCurrency()
  const getIbexFee = useIbexFee()

  const { paymentDestination, flashUserAddress } = route.params

  const [isLoadingLnurl, setIsLoadingLnurl] = useState(false)
  const [paymentDetail, setPaymentDetail] = useState<PaymentDetail<WalletCurrency>>()
  const [asyncErrorMessage, setAsyncErrorMessage] = useState("")
  const [selectedFee, setSelectedFee] = useState<number>()
  const [selectedFeeType, setSelectedFeeType] = useState<string>()

  const { data } = useSendBitcoinDetailsScreenQuery({
    fetchPolicy: "cache-first",
    returnPartialData: true,
    skip: !useIsAuthed(),
  })
  const { data: withdrawalLimitsData } = useSendBitcoinWithdrawalLimitsQuery({
    fetchPolicy: "no-cache",
    skip:
      !useIsAuthed() ||
      !paymentDetail?.paymentType ||
      paymentDetail.paymentType === "intraledger",
  })
  const { data: intraledgerLimitsData } = useSendBitcoinInternalLimitsQuery({
    fetchPolicy: "no-cache",
    skip:
      !useIsAuthed() ||
      !paymentDetail?.paymentType ||
      paymentDetail.paymentType !== "intraledger",
  })

  const defaultWallet = persistentState.defaultWallet

  const usdWallet = getUsdWallet(data?.me?.defaultAccount?.wallets)
  const usdBalanceMoneyAmount = toUsdMoneyAmount(usdWallet?.balance)
  const btcBalanceMoneyAmount = toBtcMoneyAmount(btcWallet.balance || btcWallet?.balance)

  useEffect(() => {
    // we are caching the _convertMoneyAmount when the screen loads.
    // this is because the _convertMoneyAmount can change while the user is on this screen
    // and we don't want to update the payment detail with a new convertMoneyAmount
    if (_convertMoneyAmount) {
      setPaymentDetail(
        (paymentDetail) =>
          paymentDetail && paymentDetail.setConvertMoneyAmount(_convertMoneyAmount),
      )
    }
  }, [_convertMoneyAmount])

  // we set the default values when the screen loads
  // this only run once (doesn't re-run after paymentDetail is set)
  useEffect(() => {
    if (!(paymentDetail || !defaultWallet || !_convertMoneyAmount)) {
      let initialPaymentDetail = paymentDestination.createPaymentDetail({
        convertMoneyAmount: _convertMoneyAmount,
        sendingWalletDescriptor: {
          id: defaultWallet.id,
          currency: defaultWallet.walletCurrency,
        },
      })

      // Start with usd as the unit of account
      if (initialPaymentDetail.canSetAmount) {
        initialPaymentDetail = initialPaymentDetail.setAmount(zeroDisplayAmount)
      }

      setPaymentDetail(initialPaymentDetail)
    }
  }, [
    paymentDestination,
    _convertMoneyAmount,
    paymentDetail,
    defaultWallet,
    zeroDisplayAmount,
  ])

  const fetchSendingFee = async (pd: PaymentDetail<WalletCurrency>) => {
    if (pd) {
      if (pd?.sendingWalletDescriptor.currency === "BTC") {
        const { fee, err }: { fee: any; err: any } = await fetchBreezFee(
          pd?.paymentType,
          pd?.destination,
          pd?.settlementAmount.amount,
          selectedFee, // feeRateSatPerVbyte
        )
        if (fee === null && err) {
          setAsyncErrorMessage(`${err?.message} (amount + fee)` || "")
          return false
        }
      } else {
        const estimatedFee = await getIbexFee(pd.getFee)
        if (
          _convertMoneyAmount &&
          estimatedFee &&
          pd.settlementAmount.amount + estimatedFee?.amount > usdBalanceMoneyAmount.amount
        ) {
          const amount = formatDisplayAndWalletAmount({
            displayAmount: _convertMoneyAmount(usdBalanceMoneyAmount, DisplayCurrency),
            walletAmount: usdBalanceMoneyAmount,
          })
          setAsyncErrorMessage(
            LL.SendBitcoinScreen.amountExceed({
              balance: amount,
            }) + "(amount + fee)",
          )
          return false
        }
      }
      return true
    }
  }

  const goToNextScreen =
    (paymentDetail?.sendPaymentMutation ||
      (paymentDetail?.paymentType === "lnurl" && paymentDetail?.unitOfAccountAmount)) &&
    (async () => {
      let paymentDetailForConfirmation: PaymentDetail<WalletCurrency> = paymentDetail

      if (paymentDetail.paymentType === "lnurl") {
        const lnurlParams = paymentDetail?.lnurlParams
        try {
          setIsLoadingLnurl(true)

          const btcAmount = paymentDetail.convertMoneyAmount(
            paymentDetail.unitOfAccountAmount,
            "BTC",
          )

          const requestInvoiceParams: {
            lnUrlOrAddress: string
            tokens: Satoshis
            comment?: string
          } = {
            lnUrlOrAddress: paymentDetail.destination,
            tokens: utils.toSats(btcAmount.amount),
          }

          if (lnurlParams?.commentAllowed) {
            requestInvoiceParams.comment = paymentDetail.memo
          }

          const result = await requestInvoice(requestInvoiceParams)
          setIsLoadingLnurl(false)
          const invoice = result.invoice
          const decodedInvoice = decodeInvoiceString(invoice, network as NetworkLibGaloy)

          if (
            Math.round(Number(decodedInvoice.millisatoshis) / 1000) !== btcAmount.amount
          ) {
            setAsyncErrorMessage(LL.SendBitcoinScreen.lnurlInvoiceIncorrectAmount())
            return
          }

          paymentDetailForConfirmation = paymentDetail.setInvoice({
            paymentRequest: invoice,
            paymentRequestAmount: btcAmount,
          })
        } catch (error) {
          setIsLoadingLnurl(false)
          if (error instanceof Error) {
            crashlytics().recordError(error)
          }
          setAsyncErrorMessage(LL.SendBitcoinScreen.failedToFetchLnurlInvoice())
          return
        }
      }

      const res = await fetchSendingFee(paymentDetailForConfirmation)

      if (res && paymentDetailForConfirmation.sendPaymentMutation) {
        navigation.navigate("sendBitcoinConfirmation", {
          paymentDetail: paymentDetailForConfirmation,
          feeRateSatPerVbyte: selectedFee,
        })
      }
    })

  const onSelectFee = (type: string, value?: number) => {
    setSelectedFeeType(type)
    setSelectedFee(value)
  }

  const amountStatus = isValidAmount({
    paymentDetail,
    usdWalletAmount: usdBalanceMoneyAmount,
    btcWalletAmount: btcBalanceMoneyAmount,
    intraledgerLimits: intraledgerLimitsData?.me?.defaultAccount?.limits?.internalSend,
    withdrawalLimits: withdrawalLimitsData?.me?.defaultAccount?.limits?.withdrawal,
  })

  const isDisabled =
    !amountStatus.validAmount ||
    !!asyncErrorMessage ||
    (paymentDetail?.sendingWalletDescriptor.currency === "BTC" &&
      paymentDetail.paymentType === "onchain" &&
      !selectedFee)

  if (paymentDetail) {
    return (
      <Screen
        preset="scroll"
        style={styles.screenStyle}
        keyboardOffset="navigationHeader"
        keyboardShouldPersistTaps="handled"
      >
        <ChooseWallet
          usdWallet={usdWallet}
          wallets={data?.me?.defaultAccount?.wallets as any[]}
          paymentDetail={paymentDetail}
          setPaymentDetail={setPaymentDetail}
        />
        <DetailDestination
          flashUserAddress={flashUserAddress}
          paymentDetail={paymentDetail}
        />
        <DetailAmountNote
          usdWallet={usdWallet}
          paymentDetail={paymentDetail}
          setPaymentDetail={setPaymentDetail}
          setAsyncErrorMessage={setAsyncErrorMessage}
        />
        {paymentDetail.sendingWalletDescriptor.currency === "BTC" &&
          paymentDetail.paymentType === "onchain" && (
            <Fees
              wrapperStyle={{ marginTop: 0 }}
              selectedFeeType={selectedFeeType}
              onSelectFee={onSelectFee}
            />
          )}
        <SendBitcoinDetailsExtraInfo
          errorMessage={asyncErrorMessage}
          amountStatus={amountStatus}
          currentLevel={currentLevel}
        />
        <View style={styles.buttonContainer}>
          <GaloyPrimaryButton
            onPress={goToNextScreen || undefined}
            loading={isLoadingLnurl}
            disabled={isDisabled}
            title={LL.common.next()}
          />
        </View>
      </Screen>
    )
  } else {
    return null
  }
}
export default SendBitcoinDetailsScreen

const useStyles = makeStyles(({ colors }) => ({
  screenStyle: {
    padding: 20,
    flexGrow: 1,
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
}))
