import { GaloyInstance } from "@app/config"

export const getPosUrl = (instance: GaloyInstance, address: string): string => {
  return `${instance.posUrl}/${address}`
}

export const getPrintableQrCodeUrl = (
  instance: GaloyInstance,
  address: string,
): string => {
  return `${instance.posUrl}/${address}/print`
}

export const getLightningAddress = (instance: GaloyInstance, address: string): string => {
  return `${address}@${instance.lnAddressHostname}`
}
