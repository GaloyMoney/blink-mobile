import * as lightningPayReq from "bolt11"

// helper for bolt11

export const getDescription = (decoded) => 
  decoded.tags.find(value => value.tagName === "description")?.data

export const getHashFromInvoice = (encoded) => {
  const decoded = lightningPayReq.decode(encoded)                
  return decoded.tags.find(value => value.tagName === "payment_hash")?.data
}
