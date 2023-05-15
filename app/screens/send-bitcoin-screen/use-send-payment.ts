import {
  HomeAuthedDocument,
  PaymentSendResult,
  useIntraLedgerPaymentSendMutation,
  useIntraLedgerUsdPaymentSendMutation,
  useLnInvoicePaymentSendMutation,
  useLnNoAmountInvoicePaymentSendMutation,
  useLnNoAmountUsdInvoicePaymentSendMutation,
  useOnChainPaymentSendMutation,
  useOnChainUsdPaymentSendAsBtcDenominatedMutation,
  useOnChainUsdPaymentSendMutation,
} from "@app/graphql/generated"
import { useMemo } from "react"
import { SendPaymentMutation } from "./payment-details/index.types"
import { gql } from "@apollo/client"
import { getErrorMessages } from "@app/graphql/utils"

type UseSendPaymentResult = {
  loading: boolean
  sendPayment:
    | (() => Promise<{
        status: PaymentSendResult | null | undefined
        errorsMessage?: string
      }>)
    | undefined
    | null
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

  const [onChainUsdPaymentSend, { loading: onChainUsdPaymentSendLoading }] =
    useOnChainUsdPaymentSendMutation({ refetchQueries: [HomeAuthedDocument] })

  const [
    onChainUsdPaymentSendAsBtcDenominated,
    { loading: onChainUsdPaymentSendAsBtcDenominatedLoading },
  ] = useOnChainUsdPaymentSendAsBtcDenominatedMutation({
    refetchQueries: [HomeAuthedDocument],
  })

  const loading =
    intraLedgerPaymentSendLoading ||
    intraLedgerUsdPaymentSendLoading ||
    lnInvoicePaymentSendLoading ||
    lnNoAmountInvoicePaymentSendLoading ||
    lnNoAmountUsdInvoicePaymentSendLoading ||
    onChainPaymentSendLoading ||
    onChainUsdPaymentSendLoading ||
    onChainUsdPaymentSendAsBtcDenominatedLoading

  const sendPayment = useMemo(() => {
    return (
      sendPaymentMutation &&
      (async () => {
        const { status, errors } = await sendPaymentMutation({
          intraLedgerPaymentSend,
          intraLedgerUsdPaymentSend,
          lnInvoicePaymentSend,
          lnNoAmountInvoicePaymentSend,
          lnNoAmountUsdInvoicePaymentSend,
          onChainPaymentSend,
          onChainUsdPaymentSend,
          onChainUsdPaymentSendAsBtcDenominated,
        })
        let errorsMessage = undefined
        if (errors) {
          errorsMessage = getErrorMessages(errors)
        }
        return { status, errorsMessage }
      })
    )
  }, [
    sendPaymentMutation,
    intraLedgerPaymentSend,
    intraLedgerUsdPaymentSend,
    lnInvoicePaymentSend,
    lnNoAmountInvoicePaymentSend,
    lnNoAmountUsdInvoicePaymentSend,
    onChainPaymentSend,
    onChainUsdPaymentSend,
    onChainUsdPaymentSendAsBtcDenominated,
  ])

  return {
    loading,
    sendPayment,
  }
}
