
// helper for bolt11

export const getDescription = (decoded) => 
  decoded.tags.find(value => value.tagName === "description")?.data

export const getHash = (decoded) => 
  decoded.tags.find(value => value.tagName === "payment_hash")?.data
