import { gql } from "@apollo/client"
import { Screen } from "@app/components/screen"
import { useRealtimePriceQuery, WalletCurrency } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useI18nContext } from "@app/i18n/i18n-react"
import { requestNotificationPermission } from "@app/utils/notifications"
import { useIsFocused, useNavigation } from "@react-navigation/native"
import React, { useEffect, useState } from "react"
import { Pressable, TextInput, View } from "react-native"
import { TouchableWithoutFeedback } from "react-native-gesture-handler"
import { testProps } from "../../utils/testProps"
import { MyLnUpdateSub, withMyLnUpdateSub } from "./my-ln-updates-sub"
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
import { AmountInput } from "@app/components/amount-input"
import NoteIcon from "@app/assets/icons/note.svg"
import { NoteInput } from "@app/components/note-input"
import Icon from "react-native-vector-icons/Ionicons"

const ReceiveScreen = () => {
  const {
    theme: { colors },
  } = useTheme()
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

  useEffect(() => {
    if (request?.state === PaymentRequestState.Paid) {
      const id = setTimeout(() => navigation.goBack(), 5000)
      return () => clearTimeout(id)
    }
  }, [request?.state])

  if (!request) return <></>
  const {
    type,
    setType,
    regenerateInvoice,
    info,
    state,
    canSetMemo,
    canUsePaycode,
    canSetReceivingWalletDescriptor,
    receivingWalletDescriptor,
    setReceivingWallet,
  } = request

  return (
    <>
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
            { id: WalletCurrency.Usd, text: "Stablesats", icon: "logo-usd" },
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
          expired={request.state === PaymentRequestState.Expired}
          regenerateInvoiceFn={request.regenerateInvoice}
          copyToClipboard={request.copyToClipboard}
        />

        <View style={styles.invoiceActions}>
          <View style={styles.copyInvoiceContainer}>
            <Pressable
              {...testProps(LL.ReceiveScreen.copyInvoice())}
              onPress={request.copyToClipboard}
            >
              <Text color={colors.grey2}>
                <Icon color={colors.grey2} name="copy-outline" />
                <Text> </Text>
                {LL.ReceiveScreen.copyInvoice()}
              </Text>
            </Pressable>
          </View>
          <View style={styles.shareInvoiceContainer}>
            <Pressable
              {...testProps(LL.ReceiveScreen.shareInvoice())}
              onPress={request.share}
            >
              <Text color={colors.grey2}>
                <Icon color={colors.grey2} name="share-outline" />
                <Text> </Text>
                {LL.ReceiveScreen.shareInvoice()}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.extraDetails}>
          <Text>{request.extraDetails}</Text>
        </View>

        <ButtonGroup
          selectedId={type}
          buttons={[
            { id: Invoice.Lightning, text: "Invoice", icon: "md-flash" },
            { id: Invoice.PayCode, text: "Paycode", icon: "md-at" },
            { id: Invoice.OnChain, text: "On-chain", icon: "logo-bitcoin" },
          ]}
          onPress={(id) => setType(id as InvoiceType)}
          style={styles.invoiceTypePicker}
        />
        <AmountInput
          unitOfAccountAmount={request.unitOfAccountAmount}
          setAmount={request.setAmount}
          canSetAmount={request.canSetAmount}
          convertMoneyAmount={request.convertMoneyAmount}
          walletCurrency={receivingWalletDescriptor.currency}
          overridePlaceholderText={"Add Amount"}
        />
        <NoteInput
          onBlur={request.setMemo}
          onChangeText={request.setMemoChangeText}
          value={request.memoChangeText || ""}
          editable={canSetMemo}
          style={styles.note}
        />
      </Screen>
    </>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  screenStyle: {
    paddingHorizontal: 16,
    paddingVertical: 2,
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
  invoiceTypePicker: {
    marginBottom: 10,
  },
  note: {
    marginTop: 10,
  },
  extraDetails: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  invoiceActions: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
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
}))

export default withMyLnUpdateSub(ReceiveScreen)
