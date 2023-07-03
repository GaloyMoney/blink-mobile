import { gql } from "@apollo/client"
import { Screen } from "@app/components/screen"
import {
  useRealtimePriceQuery,
  useReceiveScreenQuery,
  WalletCurrency,
} from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useI18nContext } from "@app/i18n/i18n-react"
import { requestNotificationPermission } from "@app/utils/notifications"
import { useIsFocused, useNavigation } from "@react-navigation/native"
import React, { useEffect, useState } from "react"
import { View } from "react-native"
import { TouchableWithoutFeedback } from "react-native-gesture-handler"
import { testProps } from "../../utils/testProps"
import { MyLnUpdateSub } from "./my-ln-updates-sub"
import { makeStyles, Text, useTheme } from "@rneui/themed"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { getBtcWallet, getDefaultWallet, getUsdWallet } from "@app/graphql/wallets-utils"
import { ButtonGroup } from "@app/components/button-group"
import { getDefaultMemo, PaymentRequest, PaymentRequestType } from "./payment-requests"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { useAppConfig, usePriceConversion } from "@app/hooks"
import { useLevel } from "@app/graphql/level-context"
import { useReceiveBitcoin } from "./use-payment-request"

gql`
  query receiveScreen {
    globals {
      network
      feesInformation {
        deposit {
          minBankFee
          minBankFeeThreshold
        }
      }
    }
    me {
      id
      defaultAccount {
        id
        wallets {
          id
          balance
          walletCurrency
        }
        defaultWalletId
      }
    }
  }
`

const ReceiveScreen = () => {
  const styles = useStyles()
  const {
    theme: { colors },
  } = useTheme()
  const { LL } = useI18nContext()
  const navigation = useNavigation()

  const [receiveWay, setReceiveWay] = useState<PaymentRequestType>(
    PaymentRequest.Lightning,
  )
  const receiveWays = [
    { id: PaymentRequest.Lightning, text: "Invoice", icon: "md-flash" },
    { id: PaymentRequest.Paycode, text: "Paycode", icon: "md-at" },
    { id: PaymentRequest.OnChain, text: "On-chain", icon: "logo-bitcoin" },
  ]

  const isFocused = useIsFocused()
  const isAuthed = useIsAuthed()

  const {
    appConfig: {
      galoyInstance: { name: bankName },
    },
  } = useAppConfig()

  const { formatDisplayAndWalletAmount, zeroDisplayAmount } = useDisplayCurrency()
  const { isAtLeastLevelOne } = useLevel()

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

  const { data } = useReceiveScreenQuery({
    fetchPolicy: "cache-first",
    skip: !isAuthed,
  })
  const network = data?.globals?.network
  const minBankFee = data?.globals?.feesInformation?.deposit?.minBankFee
  const minBankFeeThreshold = data?.globals?.feesInformation?.deposit?.minBankFeeThreshold

  // forcing price refresh
  useRealtimePriceQuery({
    fetchPolicy: "network-only",
    skip: !isAuthed,
  })

  const defaultCurrency = getDefaultWallet(
    data?.me?.defaultAccount?.wallets,
    data?.me?.defaultAccount?.defaultWalletId,
  )?.walletCurrency

  const btcWallet = getBtcWallet(data?.me?.defaultAccount?.wallets)
  const btcWalletId = btcWallet?.id
  const usdWallet = getUsdWallet(data?.me?.defaultAccount?.wallets)
  const usdWalletId = usdWallet?.id

  const { convertMoneyAmount: _convertMoneyAmount } = usePriceConversion()

  // initialize useReceiveBitcoin hook
  useEffect(() => {
    if (
      !createPaymentRequestDetailsParams &&
      network &&
      btcWalletId &&
      zeroDisplayAmount &&
      _convertMoneyAmount
    ) {
      setCreatePaymentRequestDetailsParams({
        params: {
          bitcoinNetwork: network,
          receivingWalletDescriptor: {
            currency: WalletCurrency.Btc,
            id: btcWalletId,
          },
          memo: getDefaultMemo(bankName),
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
    receiveWay,
    data?.me?.defaultAccount.wallets,
    _convertMoneyAmount,
    zeroDisplayAmount,
    bankName,
  ])

  // notification permission
  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (isAuthed && isFocused) {
      const WAIT_TIME_TO_PROMPT_USER = 5000
      timeout = setTimeout(
        requestNotificationPermission, // no op if already requested
        WAIT_TIME_TO_PROMPT_USER,
      )
    }
    return () => timeout && clearTimeout(timeout)
  }, [isAuthed, isFocused])

  return (
    <MyLnUpdateSub>
      <Screen
        preset="scroll"
        keyboardOffset="navigationHeader"
        keyboardShouldPersistTaps="handled"
        style={styles.screenStyle}
      >
        <ButtonGroup
          selectedId={receiveWay}
          buttons={receiveWays}
          onPress={(id) => setReceiveWay(id as PaymentRequestType)}
        />
      </Screen>
    </MyLnUpdateSub>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  screenStyle: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexGrow: 1,
  },
  tabRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "center",
    marginTop: 12,
  },
  usdActive: {
    backgroundColor: colors.green,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    width: 150,
    height: 30,
    margin: 5,
  },
  btcActive: {
    backgroundColor: colors.primary,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    width: 150,
    height: 30,
    margin: 5,
  },
  inactiveTab: {
    backgroundColor: colors.grey3,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    width: 150,
    height: 30,
    margin: 5,
  },
}))

export default ReceiveScreen
