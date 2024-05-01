import React, { useEffect, useState } from "react"
import { Share, TouchableOpacity, View } from "react-native"
import { RouteProp, useIsFocused, useNavigation } from "@react-navigation/native"
import Clipboard from "@react-native-clipboard/clipboard"
import Icon from "react-native-vector-icons/Ionicons"
import { useI18nContext } from "@app/i18n/i18n-react"
import { makeStyles, Text, useTheme } from "@rneui/themed"
import { useReceiveBitcoin } from "./use-receive-bitcoin"
import { useAppSelector } from "@app/store/redux"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import nfcManager from "react-native-nfc-manager"
import Sound from "react-native-sound"
import { useAppConfig } from "@app/hooks"
import moment from "moment"

// components
import { Screen } from "@app/components/screen"
import { QRView } from "./qr-view"
import { AmountInput } from "@app/components/amount-input"
import { NoteInput } from "@app/components/note-input"
import { SetLightningAddressModal } from "@app/components/set-lightning-address-modal"
import { withMyLnUpdateSub } from "./my-ln-updates-sub"
import { CustomIcon } from "@app/components/custom-icon"
import { ModalNfc } from "@app/components/modal-nfc"
import { ReceiveTypeBottomSheet, WalletBottomSheet } from "@app/components/receive-screen"

// gql
import { WalletCurrency, useWalletsQuery } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"

// breez-sdk
import { paymentEvents } from "@app/utils/breez-sdk"

// utils
import { requestNotificationPermission } from "@app/utils/notifications"
import { testProps } from "../../utils/testProps"

// types
import { Invoice, InvoiceType, PaymentRequestState } from "./payment/index.types"

// Load the sound file
const paymentReceivedSound = new Sound("coins", Sound.MAIN_BUNDLE, (error) => {
  if (error) {
    console.log("Failed to load the sound", error)
  }
})

type Props = {
  route: RouteProp<RootStackParamList, "receiveBitcoin">
}

const ReceiveScreen = ({ route }: Props) => {
  const { isAdvanceMode } = useAppSelector((state) => state.settings)
  const { userData } = useAppSelector((state) => state.user)
  const {
    theme: { colors },
  } = useTheme()
  const styles = useStyles()
  const { LL } = useI18nContext()
  const navigation = useNavigation()

  const { appConfig } = useAppConfig()
  const isAuthed = useIsAuthed()
  const isFocused = useIsFocused()

  const lnAddressHostname = appConfig.galoyInstance.lnAddressHostname
  const isFirstTransaction = route.params.transactionLength === 0
  const request = useReceiveBitcoin(isFirstTransaction)

  const [displayReceiveNfc, setDisplayReceiveNfc] = useState(false)
  const [currentWallet, setCurrentWallet] = useState(
    request?.receivingWalletDescriptor.currency,
  )

  // query
  const { data, loading, error } = useWalletsQuery()
  const wallets: any = data?.me?.defaultAccount.wallets
  const usdWallet = wallets?.find((el: any) => el.walletCurrency === WalletCurrency.Usd)

  const nfcText = LL.ReceiveScreen.nfc()
  useEffect(() => {
    ;(async () => {
      if (
        request?.type === "Lightning" &&
        request?.state === "Created" &&
        (await nfcManager.isSupported())
      ) {
        navigation.setOptions({
          headerRight: () => (
            <TouchableOpacity
              style={styles.nfcIcon}
              onPress={() => setDisplayReceiveNfc(true)}
            >
              <Text type="p2">{nfcText}</Text>
              <CustomIcon name="nfc" color={colors.black} />
            </TouchableOpacity>
          ),
        })
      } else {
        navigation.setOptions({ headerRight: () => <></> })
      }
    })()
    // Disable exhaustive-deps because styles.nfcIcon was causing an infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nfcText, colors.black, navigation, request?.state, request?.type])

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
    if (isAdvanceMode) {
      switch (request?.type) {
        case Invoice.OnChain:
          navigation.setOptions({ title: LL.ReceiveScreen.receiveViaOnchain() })
          break
        case Invoice.Lightning:
          navigation.setOptions({ title: LL.ReceiveScreen.receiveViaInvoice() })
          break
        case Invoice.PayCode:
          navigation.setOptions({ title: LL.ReceiveScreen.receiveViaPaycode() })
      }
    } else {
      navigation.setOptions({ title: LL.ReceiveScreen.receive() })
    }
  }, [request?.type])

  const [updatedPaymentState, setUpdatedPaymentState] = React.useState<
    string | undefined
  >(undefined)

  useEffect(() => {
    if (request) {
      // Subscribe to the "paymentSuccess" event.
      paymentEvents.once("invoicePaid", handleInvoicePaid)

      // Clean up: unsubscribe to prevent memory leaks.
      return () => {
        paymentEvents.off("invoicePaid", handleInvoicePaid)
      }
    }
  }, [request])

  useEffect(() => {
    setCurrentWallet(request?.receivingWalletDescriptor.currency)
  }, [request?.receivingWalletDescriptor?.currency])

  useEffect(() => {
    if (request?.state === PaymentRequestState.Paid) {
      const id = setTimeout(() => navigation.goBack(), 5000)
      return () => clearTimeout(id)
    }
  }, [request?.state, navigation])

  const handleInvoicePaid = () => {
    if (request) {
      request.state = PaymentRequestState.Paid
      if (request?.state === PaymentRequestState.Paid) {
        setUpdatedPaymentState(PaymentRequestState.Paid)
        const id = setTimeout(() => {
          if (navigation.canGoBack()) {
            navigation.goBack()
          }
        }, 5000)
        // Play the sound
        if (paymentReceivedSound) {
          paymentReceivedSound.play((success) => {
            if (!success) {
              console.log("Failed to play the sound.")
            }
          })
        }
        return () => clearTimeout(id)
      }
    }
  }

  if (!request) return <></>

  const OnChainCharge =
    request.feesInformation?.deposit.minBankFee &&
    request.feesInformation?.deposit.minBankFeeThreshold &&
    request.type === Invoice.OnChain ? (
      <View style={styles.onchainCharges}>
        <Text type="p4">
          {LL.ReceiveScreen.fees({
            minBankFee: request.feesInformation?.deposit.minBankFee,
            minBankFeeThreshold: request.feesInformation?.deposit.minBankFeeThreshold,
          })}
        </Text>
      </View>
    ) : undefined

  const isReady = request.state !== PaymentRequestState.Loading

  const lnurlp = usdWallet?.lnurlp || ""
  const useLnurlp =
    request.type === "PayCode" &&
    request.receivingWalletDescriptor.currency === "USD" &&
    Boolean(lnurlp) &&
    Boolean(userData.username)

  const handleCopy = () => {
    if (request.type === "PayCode") {
      Clipboard.setString(`${request.username}@${lnAddressHostname}`)
    } else {
      if (request.copyToClipboard) {
        request.copyToClipboard()
      }
    }
  }

  const handleShare = async () => {
    if (useLnurlp) {
      const result = await Share.share({ message: lnurlp })
    } else {
      if (request.share) {
        request.share()
      }
    }
  }

  const onChangeWallet = (id: WalletCurrency) => {
    if (isReady) {
      if (id === "BTC" && request.type === "PayCode") {
        request.setType("Lightning")
      }
      request.setReceivingWallet(id)
    }
  }

  return (
    <>
      <Screen
        preset="scroll"
        keyboardOffset="navigationHeader"
        keyboardShouldPersistTaps="handled"
        style={styles.screenStyle}
      >
        {isAdvanceMode && (
          <View style={{ flexDirection: "row", marginBottom: 10 }}>
            <WalletBottomSheet
              currency={request.receivingWalletDescriptor.currency}
              disabled={request.state === PaymentRequestState.Loading}
              onChange={onChangeWallet}
            />
            <View style={{ width: 10 }} />
            <ReceiveTypeBottomSheet
              currency={request.receivingWalletDescriptor.currency}
              type={request.type}
              disabled={request.state === PaymentRequestState.Loading}
              onChange={(id) => isReady && request.setType(id as InvoiceType)}
            />
          </View>
        )}
        {currentWallet === "BTC" && isFirstTransaction && (
          <Text style={styles.warning}>{LL.ReceiveScreen.initialDeposit()}</Text>
        )}
        <QRView
          type={request.info?.data?.invoiceType || Invoice.OnChain}
          getFullUri={useLnurlp ? lnurlp : request.info?.data?.getFullUriFn}
          loading={useLnurlp ? loading : request.state === PaymentRequestState.Loading}
          completed={
            updatedPaymentState === PaymentRequestState.Paid ||
            request.state === PaymentRequestState.Paid
          }
          err={
            request.state === PaymentRequestState.Error || (useLnurlp && error)
              ? LL.ReceiveScreen.error()
              : ""
          }
          style={styles.qrView}
          expired={request.state === PaymentRequestState.Expired}
          regenerateInvoiceFn={request.regenerateInvoice}
          copyToClipboard={handleCopy}
          isPayCode={request.type === Invoice.PayCode}
          canUsePayCode={useLnurlp || request.canUsePaycode}
          toggleIsSetLightningAddressModalVisible={
            request.toggleIsSetLightningAddressModalVisible
          }
        />

        {request.state !== PaymentRequestState.Loading &&
          request.info?.data?.invoiceType === Invoice.Lightning && (
            <View style={styles.invoiceDetails}>
              <Text color={colors.grey2}>
                {request.state === PaymentRequestState.Expired
                  ? LL.ReceiveScreen.invoiceHasExpired()
                  : `Valid for ${moment(request.info.data.expiresAt).fromNow(true)}`}
              </Text>
            </View>
          )}
        {request.state !== PaymentRequestState.Loading &&
          request.readablePaymentRequest && (
            <View style={styles.extraDetails}>
              <TouchableOpacity onPress={handleCopy}>
                <Text {...testProps("readable-payment-request")}>
                  {request.readablePaymentRequest}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShare} style={styles.shareInvoice}>
                <Icon color={colors.grey2} name="share-outline" size={20} />
              </TouchableOpacity>
            </View>
          )}
        {request.type !== "PayCode" && (
          <>
            <AmountInput
              request={request}
              unitOfAccountAmount={request.unitOfAccountAmount}
              setAmount={request.setAmount}
              canSetAmount={request.canSetAmount}
              convertMoneyAmount={request.convertMoneyAmount}
              walletCurrency={request.receivingWalletDescriptor.currency}
              showValuesIfDisabled={false}
              minAmount={
                currentWallet === "BTC" && isFirstTransaction
                  ? {
                      amount: 2501,
                      currency: "BTC",
                      currencyCode: "SAT",
                    }
                  : undefined
              }
              maxAmount={
                appConfig.galoyInstance.name === "Staging"
                  ? {
                      amount: 2500,
                      currency: "DisplayCurrency",
                      currencyCode: "USD",
                    }
                  : undefined
              }
              big={false}
            />
            <NoteInput
              onBlur={request.setMemo}
              onChangeText={request.setMemoChangeText}
              value={request.memoChangeText || ""}
              editable={request.canSetMemo}
              style={styles.note}
              big={false}
            />
          </>
        )}

        {OnChainCharge}

        <SetLightningAddressModal
          isVisible={request.isSetLightningAddressModalVisible}
          toggleModal={request.toggleIsSetLightningAddressModalVisible}
        />
        <ModalNfc
          isActive={displayReceiveNfc}
          setIsActive={setDisplayReceiveNfc}
          settlementAmount={request.settlementAmount}
          receiveViaNFC={request.receiveViaNFC}
        />
      </Screen>
    </>
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
    marginBottom: 10,
  },
  invoiceDetails: {
    alignItems: "center",
    marginBottom: 10,
  },
  shareInvoice: {
    marginLeft: 5,
  },
  onchainCharges: { marginTop: 10, alignItems: "center" },
  warning: {
    fontSize: 12,
    color: colors.warning,
    marginBottom: 10,
  },
  nfcIcon: {
    marginTop: -1,
    marginRight: 14,
    padding: 8,
    display: "flex",
    flexDirection: "row",
    columnGap: 4,
    backgroundColor: colors.grey5,
    borderRadius: 4,
  },
}))

export default withMyLnUpdateSub(ReceiveScreen)
