import * as lightningPayReq from "bolt11"

// helper for bolt11

// export const getHashFromInvoice = (request) => {
//   return parsePaymentRequest({request}).id
// }

// export const getDescription = (request): number | undefined => {
//   return parsePaymentRequest({request}).description
// }

// export const getAmount = (request): number | undefined => {
//   return parsePaymentRequest({request}).tokens
// }

export const getDescription = (
  decoded: lightningPayReq.PaymentRequestObject,
): lightningPayReq.TagData | undefined =>
  decoded.tags.find((value) => value.tagName === "description")?.data

export const getDestination = (decoded: lightningPayReq.PaymentRequestObject): string | undefined =>
  decoded.payeeNodeKey

export const getHashFromInvoice = (invoice: string): lightningPayReq.TagData | undefined=> {
  const decoded = lightningPayReq.decode(invoice)
  return decoded.tags.find((value) => value.tagName === "payment_hash")?.data
}
