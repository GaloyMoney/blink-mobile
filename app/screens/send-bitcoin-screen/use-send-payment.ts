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
import { useMemo, useState } from "react"
import { SendPaymentMutation } from "./payment-details/index.types"
import { gql } from "@apollo/client"
import { getErrorMessages } from "@app/graphql/utils"

// Breez SDK
import {
  sendPaymentBreezSDK,
  parseInvoiceBreezSDK,
  sendOnchainBreezSDK,
  recommendedFeesBreezSDK,
  fetchReverseSwapFeesBreezSDK,
  payLnurlBreezSDK,
  sendNoAmountPaymentBreezSDK,
} from "@app/utils/breez-sdk"

import * as sdk from "@breeztech/react-native-breez-sdk"
import { WalletAmount } from "@app/types/amounts"

let event: { type: string; data?: sdk.EventData | undefined }
sdk.addEventListener((type, data) => {
  if (type === "invoicePaid") event = { type, data }
})

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

gql`
  mutation intraLedgerPaymentSend($input: IntraLedgerPaymentSendInput!) {
    intraLedgerPaymentSend(input: $input) {
      errors {
        message
      }
      status
    }
  }

  mutation intraLedgerUsdPaymentSend($input: IntraLedgerUsdPaymentSendInput!) {
    intraLedgerUsdPaymentSend(input: $input) {
      errors {
        message
      }
      status
    }
  }

  mutation lnNoAmountInvoicePaymentSend($input: LnNoAmountInvoicePaymentInput!) {
    lnNoAmountInvoicePaymentSend(input: $input) {
      errors {
        message
      }
      status
    }
  }

  mutation lnInvoicePaymentSend($input: LnInvoicePaymentInput!) {
    lnInvoicePaymentSend(input: $input) {
      errors {
        message
      }
      status
    }
  }

  mutation lnNoAmountUsdInvoicePaymentSend($input: LnNoAmountUsdInvoicePaymentInput!) {
    lnNoAmountUsdInvoicePaymentSend(input: $input) {
      errors {
        message
      }
      status
    }
  }

  mutation onChainPaymentSend($input: OnChainPaymentSendInput!) {
    onChainPaymentSend(input: $input) {
      errors {
        message
      }
      status
    }
  }

  mutation onChainPaymentSendAll($input: OnChainPaymentSendAllInput!) {
    onChainPaymentSendAll(input: $input) {
      errors {
        message
      }
      status
    }
  }

  mutation onChainUsdPaymentSend($input: OnChainUsdPaymentSendInput!) {
    onChainUsdPaymentSend(input: $input) {
      errors {
        message
      }
      status
    }
  }

  mutation onChainUsdPaymentSendAsBtcDenominated(
    $input: OnChainUsdPaymentSendAsBtcDenominatedInput!
  ) {
    onChainUsdPaymentSendAsBtcDenominated(input: $input) {
      errors {
        message
      }
      status
    }
  }
`

export const useSendPayment = (
  sendPaymentMutation?: SendPaymentMutation | null,
  paymentRequest?: string,
  amountMsats?: WalletAmount<WalletCurrency>,
  // eslint-disable-next-line max-params
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
    let invoice: sdk.LnInvoice | null = null
    let currentFees: sdk.ReverseSwapPairInfo
    let status: PaymentSendResult | null | undefined = null
    let errors: readonly GraphQlApplicationError[] | undefined
    console.log("hasAttemptedSend:", hasAttemptedSend)
    return sendPaymentMutation && !hasAttemptedSend
      ? async () => {
          console.log("paymentRequest Step 1")
          setHasAttemptedSend(true)
          if (paymentRequest && amountMsats?.currency === "BTC") {
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
            } else if (paymentRequest.length < 64) {
              try {
                console.log("Fetching reverse swap fees using Breez SDK")
                currentFees = await fetchReverseSwapFeesBreezSDK({
                  sendAmountSat: amountMsats?.amount || 50000,
                })
              } catch (error) {
                console.error("Error fetching reverse swap fees with Breez SDK:", error)
                return {
                  status: PaymentSendResult.Failure,
                  errorsMessage: "Failed to fetch fees",
                }
              }
            }
            // Try using Breez SDK for lnNoAmountInvoicePaymentSend
            if (
              sendPaymentMutation.name === "sendPaymentMutation" &&
              paymentRequest.length > 110 &&
              !paymentRequest.toLowerCase().startsWith("lnurl") &&
              invoice?.amountMsat !== null
            ) {
              console.log("Starting sendPaymentBreezSDK using invoice with amount")
              try {
                const payment = await sendNoAmountPaymentBreezSDK(paymentRequest)
                if (payment) {
                  console.log("payment made")
                  return {
                    status:
                      event?.type === "invoicePaid"
                        ? PaymentSendResult?.Success
                        : PaymentSendResult?.Failure,
                    errors: [],
                  }
                }
                return {
                  status: PaymentSendResult.Failure,
                  errors: [],
                }
              } catch (err) {
                console.error("Failed to send payment using Breez SDK:", err)
              }
            } else if (
              sendPaymentMutation?.name === "sendPaymentMutation" &&
              paymentRequest.length > 110 &&
              !paymentRequest.toLowerCase().startsWith("lnurl") &&
              invoice?.amountMsat === null &&
              amountMsats?.amount
            ) {
              console.log("Starting sendPaymentBreezSDK using invoice without amount")
              try {
                const payment = await sendPaymentBreezSDK(
                  paymentRequest,
                  amountMsats.amount,
                )
                console.log(
                  "sendPaymentBreezSDK using invoice without amount DEBUG:",
                  JSON.stringify(payment, null, 2),
                )
                return {
                  status: payment.paymentTime
                    ? PaymentSendResult.Success
                    : PaymentSendResult.Failure,
                  errors: [],
                }
              } catch (err) {
                console.error("Failed to send payment using Breez SDK:", err)
              }
            } else if (
              sendPaymentMutation?.name === "sendPaymentMutation" &&
              (paymentRequest.toLowerCase().startsWith("lnurl") ||
                paymentRequest.includes("@"))
            ) {
              console.log("Starting payLnurlBreezSDK using lnurl or lightning address")
              try {
                const payment = await payLnurlBreezSDK(
                  paymentRequest,
                  amountMsats?.amount || 1000,
                )
                console.log("payment:", JSON.stringify(payment, null, 2))
                return {
                  status:
                    payment.type === "endpointSuccess"
                      ? PaymentSendResult.Failure
                      : PaymentSendResult.Success,
                  errors: [],
                }
              } catch (err) {
                console.error("Failed to send payment using Breez SDK:", err)
              }
            } else if (
              sendPaymentMutation?.name === "_sendPaymentMutation" &&
              paymentRequest.length < 64
            ) {
              console.log("Starting sendOnchainBreezSDK using destination address")
              if (currentFees) {
                try {
                  const recommendedFees = await recommendedFeesBreezSDK()
                  const reverseSwapInfo = await sendOnchainBreezSDK(
                    currentFees,
                    paymentRequest,
                    recommendedFees.hourFee,
                  )
                  return {
                    status: reverseSwapInfo.status
                      ? PaymentSendResult.Success
                      : PaymentSendResult.Failure,
                    errors: [],
                  }
                } catch (err) {
                  console.error("Failed to send On-Chain payment using Breez SDK:", err)
                }
              } else {
                console.error("currentFees is null")
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
