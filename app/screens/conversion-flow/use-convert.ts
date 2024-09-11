import { useEffect, useState } from "react"

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
import { getErrorMessages } from "@app/graphql/utils"

// Breez SDK
import { parseInvoiceBreezSDK, sendPaymentBreezSDK } from "@app/utils/breez-sdk-liquid"

// types
import { SendPaymentMutation } from "../send-bitcoin-screen/payment-details"
import { WalletAmount } from "@app/types/amounts"

type UseConvertResult = {
  loading: boolean
  sendPayment: any
  hasAttemptedSend: boolean
}

export const useConvert = (): UseConvertResult => {
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

  const sendPayment = async (
    sendPaymentMutation?: SendPaymentMutation | null,
    paymentRequest?: string,
    amountSats?: WalletAmount<WalletCurrency>,
  ) => {
    if (!(sendPaymentMutation && !hasAttemptedSend)) {
      return
    }

    setHasAttemptedSend(true)
    if (paymentRequest && amountSats?.currency === "BTC") {
      if (
        sendPaymentMutation.name === "sendPaymentMutation" &&
        paymentRequest.length > 110 &&
        !paymentRequest.toLowerCase().startsWith("lnurl")
      ) {
        try {
          const invoice = await parseInvoiceBreezSDK(paymentRequest)
          if (invoice.amountMsat !== null) {
            const response = await sendPaymentBreezSDK(paymentRequest)
            console.log("BreezSDK LNInvoice response:", response)
            return {
              status: PaymentSendResult.Success,
              errorsMessage: undefined,
            }
          } else {
            return {
              status: PaymentSendResult.Failure,
              errorsMessage: "No Amount Invoice is not supported",
            }
          }
        } catch (err: any) {
          return {
            status: PaymentSendResult.Failure,
            errorsMessage: err.message,
          }
        }
      }
    } else {
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

  return {
    hasAttemptedSend,
    loading,
    sendPayment,
  }
}
