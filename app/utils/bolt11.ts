import * as lightningPayReq from "bolt11"
// const {parsePaymentRequest} = require('invoices');

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

export const getUsername = (decoded) =>
  decoded.tags.find((value) => value.tagName === "username")?.data

export const getDescription = (decoded) =>
  decoded.tags.find((value) => value.tagName === "description")?.data

export const getDestination = (decoded) => decoded.payeeNodeKey

export const getHashFromInvoice = (invoice) => {
  const decoded = lightningPayReq.decode(invoice)
  return decoded.tags.find((value) => value.tagName === "payment_hash")?.data
}
