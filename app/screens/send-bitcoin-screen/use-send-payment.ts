import { useMemo, useState } from "react"
import * as sdk from "@breeztech/react-native-breez-sdk-liquid"

// gql
import {
  HomeAuthedDocument,
  PaymentSendResult,
  useIntraLedgerPaymentSendMutation,
  useIntraLedgerUsdPaymentSendMutation,
  useLnInvoicePaymentSendMutation,
  useLnNoAmountInvoicePaymentSendMutation,
  useLnNoAmountUsdInvoicePaymentSendMutation,
  useOnChainPaymentSendMutation,
  useOnChainPaymentSendAllMutation,
  useOnChainUsdPaymentSendAsBtcDenominatedMutation,
  useOnChainUsdPaymentSendMutation,
  WalletCurrency,
} from "@app/graphql/generated"

// utils
import { getErrorMessages } from "@app/graphql/utils"

// types
import { SendPaymentMutation } from "./payment-details/index.types"
import { WalletAmount } from "@app/types/amounts"

// Breez SDK
import {
  sendPaymentBreezSDK,
  parseInvoiceBreezSDK,
  sendOnchainBreezSDK,
  payLnurlBreezSDK,
} from "@app/utils/breez-sdk-liquid"

type UseSendPaymentResult = {
  loading: boolean
  sendPayment:
    | (() => Promise<{
        status: PaymentSendResult | null | undefined
        errorsMessage?: string
      }>)
    | undefined
    | null
  hasAttemptedSend: boolean
}

export const useSendPayment = (
  sendPaymentMutation?: SendPaymentMutation | null,
  paymentRequest?: string,
  amountSats?: WalletAmount<WalletCurrency>,
  feeRateSatPerVbyte?: number,
  memo?: string,
): UseSendPaymentResult => {
  const [intraLedgerPaymentSend, { loading: intraLedgerPaymentSendLoading }] =
    useIntraLedgerPaymentSendMutation({ refetchQueries: [HomeAuthedDocument] })
  const [intraLedgerUsdPaymentSend, { loading: intraLedgerUsdPaymentSendLoading }] =
    useIntraLedgerUsdPaymentSendMutation({ refetchQueries: [HomeAuthedDocument] })
  const [lnInvoicePaymentSend, { loading: lnInvoicePaymentSendLoading }] =
    useLnInvoicePaymentSendMutation({ refetchQueries: [HomeAuthedDocument] })
  const [lnNoAmountInvoicePaymentSend, { loading: lnNoAmountInvoicePaymentSendLoading }] =
    useLnNoAmountInvoicePaymentSendMutation({ refetchQueries: [HomeAuthedDocument] })
  const [
    lnNoAmountUsdInvoicePaymentSend,
    { loading: lnNoAmountUsdInvoicePaymentSendLoading },
  ] = useLnNoAmountUsdInvoicePaymentSendMutation({ refetchQueries: [HomeAuthedDocument] })
  const [onChainPaymentSend, { loading: onChainPaymentSendLoading }] =
    useOnChainPaymentSendMutation({ refetchQueries: [HomeAuthedDocument] })
  const [onChainPaymentSendAll, { loading: onChainPaymentSendAllLoading }] =
    useOnChainPaymentSendAllMutation({ refetchQueries: [HomeAuthedDocument] })
  const [onChainUsdPaymentSend, { loading: onChainUsdPaymentSendLoading }] =
    useOnChainUsdPaymentSendMutation({ refetchQueries: [HomeAuthedDocument] })
  const [
    onChainUsdPaymentSendAsBtcDenominated,
    { loading: onChainUsdPaymentSendAsBtcDenominatedLoading },
  ] = useOnChainUsdPaymentSendAsBtcDenominatedMutation({
    refetchQueries: [HomeAuthedDocument],
  })

  const [hasAttemptedSend, setHasAttemptedSend] = useState(false)

  const loading =
    intraLedgerPaymentSendLoading ||
    intraLedgerUsdPaymentSendLoading ||
    lnInvoicePaymentSendLoading ||
    lnNoAmountInvoicePaymentSendLoading ||
    lnNoAmountUsdInvoicePaymentSendLoading ||
    onChainPaymentSendLoading ||
    onChainPaymentSendAllLoading ||
    onChainUsdPaymentSendLoading ||
    onChainUsdPaymentSendAsBtcDenominatedLoading

  const sendPayment = useMemo(() => {
    return sendPaymentMutation && !hasAttemptedSend
      ? async () => {
          setHasAttemptedSend(true)
          if (paymentRequest && amountSats?.currency === "BTC") {
            let invoice: sdk.LnInvoice | null = null
            if (
              paymentRequest.length > 110 &&
              !paymentRequest.toLowerCase().startsWith("lnurl")
            ) {
              try {
                console.log("Parsing invoice using Breez SDK")
                invoice = await parseInvoiceBreezSDK(paymentRequest)
              } catch (error) {
                console.error("Error parsing invoice with Breez SDK:", error)
                return {
                  status: PaymentSendResult.Failure,
                  errorsMessage: "Failed to parse invoice",
                }
              }
            }

            try {
              if (
                sendPaymentMutation.name === "sendPaymentMutation" &&
                paymentRequest.length > 110 &&
                !paymentRequest.toLowerCase().startsWith("lnurl") &&
                invoice?.amountMsat !== null
              ) {
                console.log("Starting sendPaymentBreezSDK using invoice with amount")
                const response = await sendPaymentBreezSDK(paymentRequest)
                console.log("BreezSDK LNInvoice response:", response)
                return {
                  status: PaymentSendResult.Success,
                  errorsMessage: undefined,
                }
              } else if (
                sendPaymentMutation?.name === "sendPaymentMutation" &&
                (paymentRequest.toLowerCase().startsWith("lnurl") ||
                  paymentRequest.includes("@"))
              ) {
                console.log("Starting payLnurlBreezSDK using lnurl or lightning address")
                const response = await payLnurlBreezSDK(
                  paymentRequest,
                  amountSats?.amount,
                  memo || "",
                )
                console.log("BreezSDK LNURL response:", response)
                return {
                  status: PaymentSendResult.Success,
                  errorsMessage: undefined,
                }
              } else if (
                sendPaymentMutation?.name === "sendPaymentMutation" &&
                paymentRequest.length < 64
              ) {
                console.log("Starting sendOnchainBreezSDK using destination address")
                const response = await sendOnchainBreezSDK(
                  paymentRequest,
                  amountSats.amount,
                  feeRateSatPerVbyte,
                )
                console.log("BreezSDK onchain response:", response)
                return {
                  status: PaymentSendResult.Success,
                  errorsMessage: undefined,
                }
              } else {
                return {
                  status: PaymentSendResult.Failure,
                  errorsMessage: "Wrong invoice type",
                }
              }
            } catch (err: any) {
              return {
                status: PaymentSendResult.Failure,
                errorsMessage: err.message,
              }
            }
          } else {
            console.log("Starting sendPaymentMutation using GraphQL")
            const response = await sendPaymentMutation({
              intraLedgerPaymentSend,
              intraLedgerUsdPaymentSend,
              lnInvoicePaymentSend,
              lnNoAmountInvoicePaymentSend,
              lnNoAmountUsdInvoicePaymentSend,
              onChainPaymentSend,
              onChainPaymentSendAll,
              onChainUsdPaymentSend,
              onChainUsdPaymentSendAsBtcDenominated,
            })
            let errorsMessage = undefined
            if (response.errors) {
              errorsMessage = getErrorMessages(response.errors)
            }
            if (response.status === PaymentSendResult.Failure) {
              setHasAttemptedSend(false)
            }
            return { status: response.status, errorsMessage }
          }
        }
      : undefined
  }, [
    sendPaymentMutation,
    hasAttemptedSend,
    paymentRequest,
    intraLedgerPaymentSend,
    intraLedgerUsdPaymentSend,
    lnInvoicePaymentSend,
    lnNoAmountInvoicePaymentSend,
    lnNoAmountUsdInvoicePaymentSend,
    onChainPaymentSend,
    onChainPaymentSendAll,
    onChainUsdPaymentSend,
    onChainUsdPaymentSendAsBtcDenominated,
  ])

  return {
    hasAttemptedSend,
    loading,
    sendPayment,
  }
}
