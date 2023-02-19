import {
  decodeInvoiceString,
  Network as NetworkLibGaloy,
} from "@galoymoney/client/dist/parsing-v2"
import { getInvoiceFullUri, TYPE_LIGHTNING_BTC } from "./helpers"
import { CreateInvoiceParams, GetFullUriFn, Invoice, InvoiceType } from "./index.types"

export const createInvoice = (params: CreateInvoiceParams): Invoice => {
  const { invoiceData, network: bitcoinNetwork } = params

  if (invoiceData.invoiceType === InvoiceType.Lightning) {
    const { paymentRequest } = invoiceData
    const invoiceDisplay = paymentRequest
    const getFullUri: GetFullUriFn = ({ uppercase, prefix }) =>
      getInvoiceFullUri({
        input: paymentRequest,
        uppercase,
        prefix,
        type: TYPE_LIGHTNING_BTC,
      })

    const dateString = decodeInvoiceString(
      paymentRequest,
      bitcoinNetwork as NetworkLibGaloy,
    ).timeExpireDateString
    const expiration = dateString ? new Date(dateString) : undefined

    return {
      invoiceDisplay,
      getFullUri,
      expiration,
      invoiceData,
    }
  }

  const { address, amount, memo } = invoiceData

  const getFullUri: GetFullUriFn = ({ uppercase, prefix }) =>
    getInvoiceFullUri({
      input: address,
      amount: amount?.amount,
      memo,
      uppercase,
      prefix,
    })
  const invoiceDisplay = getFullUri({})

  return {
    invoiceDisplay,
    getFullUri,
    invoiceData,
  }
}
