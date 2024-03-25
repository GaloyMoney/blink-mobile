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
import { useAppConfig } from "@app/hooks"

// components
import { Screen } from "@app/components/screen"
import { QRView } from "./qr-view"
import { ButtonGroup } from "@app/components/button-group"
import { AmountInput } from "@app/components/amount-input"
import { NoteInput } from "@app/components/note-input"
import { SetLightningAddressModal } from "@app/components/set-lightning-address-modal"
import { GaloyCurrencyBubble } from "@app/components/atomic/galoy-currency-bubble"
import { withMyLnUpdateSub } from "./my-ln-updates-sub"
import { CustomIcon } from "@app/components/custom-icon"
import { ModalNfc } from "@app/components/modal-nfc"

// gql
import { WalletCurrency, useAccountDefaultWalletQuery } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"

// breez-sdk
import { paymentEvents } from "@app/utils/breez-sdk"

// utils
import { requestNotificationPermission } from "@app/utils/notifications"
import { testProps } from "../../utils/testProps"

// types
import { Invoice, InvoiceType, PaymentRequestState } from "./payment/index.types"

type Props = {
  route: RouteProp<RootStackParamList, "receiveBitcoin">
}

const ReceiveScreen = ({ route }: Props) => {
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

  const isFirstTransaction = route.params.transactionLength === 0
  const request = useReceiveBitcoin(isFirstTransaction)

  const [displayReceiveNfc, setDisplayReceiveNfc] = useState(false)
  const [currentWallet, setCurrentWallet] = useState(
    request?.receivingWalletDescriptor.currency,
  )

  // query
  const { data, loading, error } = useAccountDefaultWalletQuery({
    variables: { username: userData?.username },
  })

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
  }, [request?.type, LL.ReceiveScreen, navigation])

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
        return () => clearTimeout(id)
      }
    }
  }

  // FLASH FORK DEBUGGING -----------------------------
  // console.log("request", request?.info?.data?.paymentRequest)
  // const requestString: string = request?.info?.data?.paymentRequest
  // if (requestString) {
  //   const decodedInvoiceState = decodeInvoiceString(requestString, "mainnet")
  //   console.log("decodedInvoiceState", JSON.stringify(decodedInvoiceState, null, 2))
  // }
  // --------------------------------------------------

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

  const lnurlp = data?.accountDefaultWallet.lnurlp || ""
  const useLnurlp =
    request.type === "PayCode" &&
    request.receivingWalletDescriptor.currency === "USD" &&
    Boolean(lnurlp)

  const handleCopy = () => {
    if (useLnurlp) {
      Clipboard.setString(lnurlp)
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

  return (
    <>
      <Screen
        preset="scroll"
        keyboardOffset="navigationHeader"
        keyboardShouldPersistTaps="handled"
        style={styles.screenStyle}
      >
        <ButtonGroup
          selectedId={request.receivingWalletDescriptor.currency}
          buttons={[
            {
              id: WalletCurrency.Btc,
              text: LL.ReceiveScreen.bitcoin(),
              icon: {
                selected: <GaloyCurrencyBubble currency="BTC" iconSize={16} />,
                normal: (
                  <GaloyCurrencyBubble currency="BTC" iconSize={16} highlighted={false} />
                ),
              },
            },
            {
              id: WalletCurrency.Usd,
              text: LL.ReceiveScreen.stablesats(),
              icon: {
                selected: <GaloyCurrencyBubble currency="USD" iconSize={16} />,
                normal: (
                  <GaloyCurrencyBubble currency="USD" iconSize={16} highlighted={false} />
                ),
              },
            },
          ]}
          onPress={(id) => isReady && request.setReceivingWallet(id as WalletCurrency)}
          style={styles.receivingWalletPicker}
          disabled={!request.canSetReceivingWalletDescriptor}
        />
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

        <View style={styles.invoiceActions}>
          {request.state !== PaymentRequestState.Loading &&
            (request.type !== Invoice.PayCode ||
              (request.type === Invoice.PayCode && request.canUsePaycode)) && (
              <>
                <View style={styles.copyInvoiceContainer}>
                  <TouchableOpacity
                    {...testProps(LL.ReceiveScreen.copyInvoice())}
                    onPress={handleCopy}
                  >
                    <Text {...testProps("Copy Invoice")} color={colors.grey2}>
                      <Icon color={colors.grey2} name="copy-outline" />
                      <Text> </Text>
                      {LL.ReceiveScreen.copyInvoice()}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View>
                  <Text color={colors.grey2}>
                    {request.info?.data?.invoiceType === Invoice.OnChain &&
                    request.receivingWalletDescriptor.currency === WalletCurrency.Btc
                      ? "Bitcoin On-chain Address"
                      : request.info?.data?.invoiceType === Invoice.OnChain &&
                        request.receivingWalletDescriptor.currency === WalletCurrency.Usd
                      ? "Cash On-chain Address"
                      : request.info?.data?.invoiceType === Invoice.Lightning &&
                        request.receivingWalletDescriptor.currency === WalletCurrency.Btc
                      ? "Bitcoin Invoice | Valid for 7 days"
                      : request.info?.data?.invoiceType === Invoice.Lightning &&
                        request.receivingWalletDescriptor.currency === WalletCurrency.Usd
                      ? "Cash Invoice | Valid for 5 minutes"
                      : request.info?.data?.invoiceType === Invoice.PayCode
                      ? "Lightning Address"
                      : "Invoice | Valid for 1 day"}
                  </Text>
                </View>
                <View style={styles.shareInvoiceContainer}>
                  <TouchableOpacity
                    {...testProps(LL.ReceiveScreen.shareInvoice())}
                    onPress={handleShare}
                  >
                    <Text {...testProps("Share Invoice")} color={colors.grey2}>
                      <Icon color={colors.grey2} name="share-outline" />
                      <Text> </Text>
                      {LL.ReceiveScreen.shareInvoice()}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
        </View>

        <TouchableOpacity onPress={handleCopy}>
          <View style={styles.extraDetails}>
            {request.readablePaymentRequest && (
              <Text {...testProps("readable-payment-request")}>
                {useLnurlp
                  ? `${lnurlp.slice(0, 10)}..${lnurlp.slice(-10)}`
                  : request.readablePaymentRequest}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        <ButtonGroup
          selectedId={request.type}
          buttons={[
            {
              id: Invoice.Lightning,
              text: LL.ReceiveScreen.lightning(),
              icon: "flash",
            },
            { id: Invoice.PayCode, text: LL.ReceiveScreen.paycode(), icon: "at" },
            {
              id: Invoice.OnChain,
              text: LL.ReceiveScreen.onchain(),
              icon: "logo-bitcoin",
            },
          ]}
          onPress={(id) => isReady && request.setType(id as InvoiceType)}
          style={styles.invoiceTypePicker}
        />
        <AmountInput
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
                  amount: 500,
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
    marginBottom: 15,
    minHeight: 20,
  },
  invoiceActions: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
    minHeight: 20,
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
