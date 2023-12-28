import { Screen } from "@app/components/screen"
import { WalletCurrency } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useI18nContext } from "@app/i18n/i18n-react"
import { requestNotificationPermission } from "@app/utils/notifications"
import { useIsFocused, useNavigation } from "@react-navigation/native"
import React, { useEffect } from "react"
import { TouchableOpacity, View } from "react-native"
import { testProps } from "../../utils/testProps"
import { withMyLnUpdateSub } from "./my-ln-updates-sub"
import { makeStyles, Text, useTheme } from "@rneui/themed"
import { ButtonGroup } from "@app/components/button-group"
import { useReceiveBitcoin } from "./use-receive-bitcoin"
import { Invoice, InvoiceType, PaymentRequestState } from "./payment/index.types"
import { QRView } from "./qr-view"
import { AmountInput } from "@app/components/amount-input"
import { NoteInput } from "@app/components/note-input"
import Icon from "react-native-vector-icons/Ionicons"
import { SetLightningAddressModal } from "@app/components/set-lightning-address-modal"
import { GaloyCurrencyBubble } from "@app/components/atomic/galoy-currency-bubble"

// Breez SDK
import { paymentEvents } from "@app/utils/breez-sdk"

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
    // Subscribe to the "paymentSuccess" event.
    paymentEvents.on("invoicePaid", handleInvoicePaid)

    // Clean up: unsubscribe to prevent memory leaks.
    return () => {
      paymentEvents.off("invoicePaid", handleInvoicePaid)
    }
    addEventListener(handleBreezEvent)
  }, [request?.state, navigation])

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

        <QRView
          type={request.info?.data?.invoiceType || Invoice.OnChain}
          getFullUri={request.info?.data?.getFullUriFn}
          loading={request.state === PaymentRequestState.Loading}
          completed={
            updatedPaymentState === PaymentRequestState.Paid ||
            request.state === PaymentRequestState.Paid
          }
          err={
            request.state === PaymentRequestState.Error ? LL.ReceiveScreen.error() : ""
          }
          style={styles.qrView}
          expired={request.state === PaymentRequestState.Expired}
          regenerateInvoiceFn={request.regenerateInvoice}
          copyToClipboard={request.copyToClipboard}
          isPayCode={request.type === Invoice.PayCode}
          canUsePayCode={request.canUsePaycode}
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
                    onPress={request.copyToClipboard}
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
                    onPress={request.share}
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

        <TouchableOpacity onPress={request.copyToClipboard}>
          <View style={styles.extraDetails}>
            {request.readablePaymentRequest && (
              <Text {...testProps("readable-payment-request")}>
                {request.readablePaymentRequest}
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
}))

export default withMyLnUpdateSub(ReceiveScreen)
