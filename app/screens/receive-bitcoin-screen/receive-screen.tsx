import React, { useEffect, useState } from "react"
import { useNavigation } from "@react-navigation/native"
import Clipboard from "@react-native-clipboard/clipboard"
import { useI18nContext } from "@app/i18n/i18n-react"
import { makeStyles } from "@rneui/themed"
import { useReceiveBitcoin } from "./use-receive-bitcoin"
import { useAppSelector } from "@app/store/redux"
import { useAppConfig } from "@app/hooks"

// breez
import {
  addEventListener,
  removeEventListener,
  SdkEvent,
  SdkEventVariant,
} from "@breeztech/react-native-breez-sdk-liquid"

// components
import { Screen } from "@app/components/screen"
import { QRView } from "./qr-view"
import { SetLightningAddressModal } from "@app/components/set-lightning-address-modal"
import { withMyLnUpdateSub } from "./my-ln-updates-sub"
import { ModalNfc } from "@app/components/modal-nfc"
import {
  AmountNote,
  Header,
  InvoiceInfo,
  OnChainCharge,
  WalletReceiveTypeTabs,
} from "@app/components/receive-screen"

// gql
import { WalletCurrency, useWalletsQuery } from "@app/graphql/generated"

// types
import { Invoice, PaymentRequestState } from "./payment/index.types"

// store
import { usePersistentStateContext } from "@app/store/persistent-state"

const ReceiveScreen = () => {
  const navigation = useNavigation()
  const styles = useStyles()
  const { LL } = useI18nContext()
  const { appConfig } = useAppConfig()
  const { userData } = useAppSelector((state) => state.user)
  const { data, loading, error } = useWalletsQuery()
  const request = useReceiveBitcoin()

  const { persistentState } = usePersistentStateContext()
  const [displayReceiveNfc, setDisplayReceiveNfc] = useState(false)
  const [updatedPaymentState, setUpdatedPaymentState] = React.useState<string>()
  const [lnurlp, setLnurlp] = useState<string>()
  const [breezListenerId, setBreezListenerId] = useState<string>()

  const lnAddressHostname = appConfig.galoyInstance.lnAddressHostname
  const wallets: any = data?.me?.defaultAccount.wallets
  const usdWallet = wallets?.find((el: any) => el.walletCurrency === WalletCurrency.Usd)

  useEffect(() => {
    if (
      request?.state === PaymentRequestState.Paid ||
      updatedPaymentState === PaymentRequestState.Paid
    ) {
      const id = setTimeout(() => navigation.goBack(), 5000)
      return () => clearTimeout(id)
    }
  }, [request?.state, updatedPaymentState, navigation])

  useEffect(() => {
    if (persistentState.isAdvanceMode && !breezListenerId) addBreezEventListener()
    return removeBreezEventListener
  }, [persistentState.isAdvanceMode, breezListenerId])

  useEffect(() => {
    if (
      request &&
      request.type === "PayCode" &&
      request.receivingWalletDescriptor.currency === "USD" &&
      Boolean(usdWallet?.lnurlp) &&
      Boolean(userData.username)
    ) {
      setLnurlp(usdWallet?.lnurlp)
    } else {
      setLnurlp(undefined)
    }
  }, [request, usdWallet?.lnurlp])

  const addBreezEventListener = async () => {
    const listenerId = await addEventListener((e: SdkEvent) => {
      if (
        e.type === SdkEventVariant.PAYMENT_WAITING_CONFIRMATION ||
        e.type === SdkEventVariant.PAYMENT_SUCCEEDED
      ) {
        setUpdatedPaymentState(PaymentRequestState.Paid)
      }
    })
    setBreezListenerId(listenerId)
  }

  const removeBreezEventListener = () => {
    if (breezListenerId) {
      removeEventListener(breezListenerId)
    }
  }

  const handleCopy = () => {
    if (request) {
      if (request.type === "PayCode") {
        Clipboard.setString(`${request.username}@${lnAddressHostname}`)
      } else {
        if (request.copyToClipboard) {
          request.copyToClipboard()
        }
      }
    }
  }

  if (request) {
    return (
      <>
        <Header request={request} setDisplayReceiveNfc={setDisplayReceiveNfc} />
        <Screen
          preset="scroll"
          keyboardOffset="navigationHeader"
          keyboardShouldPersistTaps="handled"
          style={styles.screenStyle}
        >
          <WalletReceiveTypeTabs request={request} />
          <QRView
            type={request.info?.data?.invoiceType || Invoice.OnChain}
            getFullUri={!!lnurlp ? lnurlp : request.info?.data?.getFullUriFn}
            loading={!!lnurlp ? loading : request.state === PaymentRequestState.Loading}
            completed={
              updatedPaymentState === PaymentRequestState.Paid ||
              request.state === PaymentRequestState.Paid
            }
            err={
              request.state === PaymentRequestState.Error || (!!lnurlp && error)
                ? LL.ReceiveScreen.error()
                : ""
            }
            style={styles.qrView}
            expired={request.state === PaymentRequestState.Expired}
            regenerateInvoiceFn={request.regenerateInvoice}
            copyToClipboard={handleCopy}
            isPayCode={request.type === Invoice.PayCode}
            canUsePayCode={!!lnurlp || request.canUsePaycode}
            toggleIsSetLightningAddressModalVisible={
              request.toggleIsSetLightningAddressModalVisible
            }
          />
          <InvoiceInfo request={request} lnurlp={lnurlp} handleCopy={handleCopy} />
          <AmountNote request={request} />
          <OnChainCharge request={request} />
          <SetLightningAddressModal
            isVisible={request.isSetLightningAddressModalVisible}
            toggleModal={request.toggleIsSetLightningAddressModalVisible}
          />
          <ModalNfc
            isActive={displayReceiveNfc}
            setIsActive={setDisplayReceiveNfc}
            settlementAmount={request.settlementAmount}
            receiveViaNFC={request.receiveViaNFC}
            onPaid={() => setUpdatedPaymentState(PaymentRequestState.Paid)}
          />
        </Screen>
      </>
    )
  } else {
    return null
  }
}

const useStyles = makeStyles(({ colors }) => ({
  screenStyle: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexGrow: 1,
  },
  qrView: {
    marginBottom: 10,
  },
}))

export default withMyLnUpdateSub(ReceiveScreen)
