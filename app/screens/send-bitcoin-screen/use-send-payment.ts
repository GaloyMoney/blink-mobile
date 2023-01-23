import {
  PaymentSendResult,
  useIntraLedgerPaymentSendMutation,
  useIntraLedgerUsdPaymentSendMutation,
  useLnInvoicePaymentSendMutation,
  useLnNoAmountInvoicePaymentSendMutation,
  useLnNoAmountUsdInvoicePaymentSendMutation,
  useOnChainPaymentSendMutation,
} from "@app/graphql/generated"
import { useState, useMemo } from "react"
import { SendPayment } from "./payment-details/index.types"

export type UseSendPaymentResult = {
  loading: boolean
  sendPayment:
    | (() => Promise<{
        status: PaymentSendResult | null | undefined
        errorsMessage?: string
      }>)
    | undefined
    | null
}

export const useSendPayment = (
  sendPaymentFn?: SendPayment | null,
): UseSendPaymentResult => {
  const [intraLedgerPaymentSend] = useIntraLedgerPaymentSendMutation()
  const [intraLedgerUsdPaymentSend] = useIntraLedgerUsdPaymentSendMutation()
  const [lnInvoicePaymentSend] = useLnInvoicePaymentSendMutation()
  const [lnNoAmountInvoicePaymentSend] = useLnNoAmountInvoicePaymentSendMutation()
  const [lnNoAmountUsdInvoicePaymentSend] = useLnNoAmountUsdInvoicePaymentSendMutation()
  const [onChainPaymentSend] = useOnChainPaymentSendMutation()
  const [loading, setLoading] = useState(false)

  const sendPayment = useMemo(() => {
    return (
      sendPaymentFn &&
      (async () => {
        setLoading(true)
        const response = await sendPaymentFn({
          intraLedgerPaymentSend,
          intraLedgerUsdPaymentSend,
          lnInvoicePaymentSend,
          lnNoAmountInvoicePaymentSend,
          lnNoAmountUsdInvoicePaymentSend,
          onChainPaymentSend,
        })
        setLoading(false)
        return response
      })
    )
  }, [
    sendPaymentFn,
    intraLedgerPaymentSend,
    intraLedgerUsdPaymentSend,
    lnInvoicePaymentSend,
    lnNoAmountInvoicePaymentSend,
    lnNoAmountUsdInvoicePaymentSend,
    onChainPaymentSend,
    setLoading,
  ])

  return {
    loading,
    sendPayment,
  }
}
