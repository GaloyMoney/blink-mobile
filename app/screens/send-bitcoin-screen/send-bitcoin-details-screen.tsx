import React, { useEffect, useState } from "react"
import { View } from "react-native"
import { makeStyles } from "@rneui/themed"
import crashlytics from "@react-native-firebase/crashlytics"

// components
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"
import { SendBitcoinDetailsExtraInfo } from "./send-bitcoin-details-extra-info"
import { Screen } from "@app/components/screen"
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
import { useBreez, usePriceConversion } from "@app/hooks"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { useI18nContext } from "@app/i18n/i18n-react"
import { usePersistentStateContext } from "@app/store/persistent-state"

// types
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { NavigationProp, RouteProp, useNavigation } from "@react-navigation/native"
import { PaymentDetail } from "./payment-details/index.types"

// utils
import { toBtcMoneyAmount, toUsdMoneyAmount } from "@app/types/amounts"
import { isValidAmount } from "./payment-details"
import { requestInvoice, utils } from "lnurl-pay"

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
  const { convertMoneyAmount: _convertMoneyAmount } = usePriceConversion()
  const { zeroDisplayAmount, formatMoneyAmount } = useDisplayCurrency()

  const { paymentDestination, flashUserAddress } = route.params

  const [isLoadingLnurl, setIsLoadingLnurl] = useState(false)
  const [paymentDetail, setPaymentDetail] = useState<PaymentDetail<WalletCurrency>>()
  const [asyncErrorMessage, setAsyncErrorMessage] = useState("")

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

  const goToNextScreen = async () => {
    if (
      paymentDetail &&
      (paymentDetail.sendPaymentMutation ||
        (paymentDetail.paymentType === "lnurl" && paymentDetail.unitOfAccountAmount))
    ) {
      let paymentDetailForConfirmation: PaymentDetail<WalletCurrency> = paymentDetail

      if (paymentDetail.paymentType === "lnurl") {
        try {
          setIsLoadingLnurl(true)

          const btcAmount = paymentDetail.convertMoneyAmount(
            paymentDetail.unitOfAccountAmount,
            "BTC",
          )

          const result = await requestInvoice({
            lnUrlOrAddress: paymentDetail.destination,
            tokens: utils.toSats(btcAmount.amount),
          })
          setIsLoadingLnurl(false)
          const invoice = result.invoice
          const decodedInvoice = decodeInvoiceString(invoice, network as NetworkLibGaloy)

          if (
            Math.round(Number(decodedInvoice.millisatoshis) / 1000) !== btcAmount.amount
          ) {
            setAsyncErrorMessage(LL.SendBitcoinScreen.lnurlInvoiceIncorrectAmount())
            return
          }

          const decodedDescriptionHash = decodedInvoice.tags.find(
            (tag) => tag.tagName === "purpose_commit_hash",
          )?.data

          if (paymentDetail.lnurlParams.metadataHash !== decodedDescriptionHash) {
            setAsyncErrorMessage(LL.SendBitcoinScreen.lnurlInvoiceIncorrectDescription())
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

      if (paymentDetailForConfirmation.sendPaymentMutation) {
        navigation.navigate("sendBitcoinConfirmation", {
          paymentDetail: paymentDetailForConfirmation,
        })
      }
    } else {
      return null
    }
  }

  const amountStatus = isValidAmount({
    paymentDetail,
    usdWalletAmount: usdBalanceMoneyAmount,
    btcWalletAmount: btcBalanceMoneyAmount,
    intraledgerLimits: intraledgerLimitsData?.me?.defaultAccount?.limits?.internalSend,
    withdrawalLimits: withdrawalLimitsData?.me?.defaultAccount?.limits?.withdrawal,
  })

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
        <SendBitcoinDetailsExtraInfo
          errorMessage={asyncErrorMessage}
          amountStatus={amountStatus}
          currentLevel={currentLevel}
        />
        <View style={styles.buttonContainer}>
          <GaloyPrimaryButton
            onPress={goToNextScreen}
            loading={isLoadingLnurl}
            disabled={!amountStatus.validAmount || !!asyncErrorMessage}
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
