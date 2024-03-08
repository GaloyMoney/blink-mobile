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
  GraphQlApplicationError,
  WalletCurrency,
} from "@app/graphql/generated"
import { getErrorMessages } from "@app/graphql/utils"

// Breez SDK
import {
  parseInvoiceBreezSDK,
  sendNoAmountPaymentBreezSDK,
  paymentEvents,
  breezHealthCheck,
} from "@app/utils/breez-sdk"
import * as sdk from "@breeztech/react-native-breez-sdk"

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

  useEffect(() => {
    return () => {
      paymentEvents.removeAllListeners("paymentSuccess")
      paymentEvents.removeAllListeners("paymentFailure")
    }
  }, [])

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

  const successPromise = new Promise<void>((resolve) => {
    paymentEvents.once("paymentSuccess", resolve)
  })

  const failurePromise = new Promise<Error>((_, reject) => {
    paymentEvents.once("paymentFailure", reject)
  })

  const sendPayment = async (
    sendPaymentMutation?: SendPaymentMutation | null,
    paymentRequest?: string,
    amountSats?: WalletAmount<WalletCurrency>,
    memo?: string,
  ) => {
    if (!(sendPaymentMutation && !hasAttemptedSend)) {
      return
    }
    let invoice: sdk.LnInvoice | null = null
    let currentFees: sdk.ReverseSwapPairInfo
    let status: PaymentSendResult | null | undefined = null
    let errors: readonly GraphQlApplicationError[] | undefined
    console.log("hasAttemptedSend:", hasAttemptedSend)
    console.log("Health Check for Breez SDK...")
    breezHealthCheck()
    setHasAttemptedSend(true)
    if (paymentRequest && amountSats?.currency === "BTC") {
      if (
        //TRUE
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

      // Try using Breez SDK for lnNoAmountInvoicePaymentSend
      if (
        // TRUE
        sendPaymentMutation.name === "sendPaymentMutation" &&
        paymentRequest.length > 110 &&
        !paymentRequest.toLowerCase().startsWith("lnurl") &&
        invoice?.amountMsat !== null
      ) {
        console.log("Starting sendPaymentBreezSDK using invoice with amount")
        try {
          const response = await sendNoAmountPaymentBreezSDK(paymentRequest)
          console.log("BreezSDK LNInvoice response:", response)
          // Wait for the payment success event
          await Promise.race([successPromise, failurePromise])
          return {
            status: PaymentSendResult.Success,
            errors: [],
          }
        } catch (err) {
          console.error("Failed to send LNInvoice using Breez SDK:", err)
          return {
            status: PaymentSendResult.Failure,
            errors: [],
          }
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
      status = response.status
      errors = response.errors
    }
    let errorsMessage = undefined
    if (errors) {
      errorsMessage = getErrorMessages(errors)
    }
    if (status === PaymentSendResult.Failure) {
      setHasAttemptedSend(false)
    }
    return { status, errorsMessage }
  }

  return {
    hasAttemptedSend,
    loading,
    sendPayment,
  }
}
