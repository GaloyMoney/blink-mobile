export const getPosUrl = (posUrl: string, address: string): string => {
  return `${posUrl}/${address}`
}

export const getPrintableQrCodeUrl = (posUrl: string, address: string): string => {
  return `${posUrl}/${address}/print`
}

export const getLightningAddress = (
  lnAddressHostname: string,
  address: string,
): string => {
  return `${address}@${lnAddressHostname}`
}
