import { gql } from "@apollo/client"
import { Screen } from "@app/components/screen"
import { useRealtimePriceQuery, WalletCurrency } from "@app/graphql/generated"
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
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { useAppConfig, usePriceConversion } from "@app/hooks"
import { useLevel } from "@app/graphql/level-context"
import { useReceiveBitcoin } from "./use-receive-bitcoin"
import { Invoice, InvoiceType, PaymentRequestState } from "./payment/index.types"
import { GaloyTertiaryButton } from "@app/components/atomic/galoy-tertiary-button"
import { QRView } from "./qr-view"

const ReceiveScreen = () => {
  const styles = useStyles()
  const { LL } = useI18nContext()
  const navigation = useNavigation()

  const isAuthed = useIsAuthed()
  const isFocused = useIsFocused()

  const request = useReceiveBitcoin()

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

  useEffect(() => {
    switch (request?.type) {
      case Invoice.OnChain:
        navigation.setOptions({ title: "Receive via Onchain" })
        break
      case Invoice.Lightning:
        navigation.setOptions({ title: "Receive via Invoice" })
        break
      case Invoice.PayCode:
        navigation.setOptions({ title: "Receive via Paycode" })
    }
  }, [request?.type])

  if (!request) return <Text>Loading</Text>
  const {
    type,
    setType,
    regenerateInvoice,
    info,
    state,
    canSetAmount,
    canSetMemo,
    canUsePaycode,
    canSetReceivingWalletDescriptor,
    receivingWalletDescriptor,
    setReceivingWallet,
  } = request

  return (
    <MyLnUpdateSub>
      <Screen
        preset="scroll"
        keyboardOffset="navigationHeader"
        keyboardShouldPersistTaps="handled"
        style={styles.screenStyle}
      >
        <ButtonGroup
          selectedId={receivingWalletDescriptor.currency}
          buttons={[
            { id: WalletCurrency.Btc, text: "Bitcoin", icon: "logo-bitcoin" },
            { id: WalletCurrency.Usd, text: "Stablesats (USD)", icon: "logo-usd" },
          ]}
          onPress={(id) => setReceivingWallet(id as WalletCurrency)}
          style={styles.receivingWalletPicker}
          disabled={!canSetReceivingWalletDescriptor}
        />
        <QRView
          type={info?.data?.invoiceType || Invoice.OnChain}
          getFullUri={info?.data?.getFullUriFn}
          loading={state === PaymentRequestState.Loading}
          completed={state === PaymentRequestState.Paid}
          err={state === PaymentRequestState.Error ? LL.ReceiveScreen.error() : ""}
          style={styles.qrView}
        />
        <ButtonGroup
          selectedId={type}
          buttons={[
            { id: Invoice.Lightning, text: "Invoice", icon: "md-flash" },
            { id: Invoice.PayCode, text: "Paycode", icon: "md-at" },
            { id: Invoice.OnChain, text: "On-chain", icon: "logo-bitcoin" },
          ]}
          onPress={(id) => setType(id as InvoiceType)}
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
  qrView: {
    marginBottom: 10,
  },
  receivingWalletPicker: {
    marginBottom: 10,
  },
}))

export default ReceiveScreen
