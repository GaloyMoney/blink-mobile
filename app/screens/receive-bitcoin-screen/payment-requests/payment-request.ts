import { decodeInvoiceString, Network as NetworkLibGaloy } from "@galoymoney/client"
import { getPaymentRequestFullUri, TYPE_LIGHTNING_BTC } from "./helpers"
import { CreatePaymentRequestParams, GetFullUriFn, PaymentRequest } from "./index.types"

export const createPaymentRequest = (
  params: CreatePaymentRequestParams,
): PaymentRequest => {
  const { paymentRequestData, network: bitcoinNetwork } = params

  if (paymentRequestData.paymentRequestType === PaymentRequest.Lightning) {
    const { paymentRequest: lnPaymentRequest } = paymentRequestData
    const paymentRequestDisplay = lnPaymentRequest
    const getFullUri: GetFullUriFn = ({ uppercase, prefix }) =>
      getPaymentRequestFullUri({
        input: lnPaymentRequest,
        uppercase,
        prefix,
        type: TYPE_LIGHTNING_BTC,
      })

    const dateString = decodeInvoiceString(
      lnPaymentRequest,
      bitcoinNetwork as NetworkLibGaloy,
    ).timeExpireDateString
    const expiration = dateString ? new Date(dateString) : undefined

    return {
      paymentRequestDisplay,
      getFullUri,
      expiration,
      paymentRequestData,
    }
  }

  const { address, amount, memo } = paymentRequestData

  const getFullUri: GetFullUriFn = ({ uppercase, prefix }) =>
    getPaymentRequestFullUri({
      input: address,
      amount: amount?.amount,
      memo,
      uppercase,
      prefix,
    })
  const paymentRequestDisplay = getFullUri({})

  return {
    paymentRequestDisplay,
    getFullUri,
    paymentRequestData,
  }
}
