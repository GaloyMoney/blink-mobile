import { GaloyInstance } from "@app/config/galoy-instances"
import { scriptHostname } from "./helper"

// TODO: Return all of these values from the API?

export const getPosUrl = (instance: GaloyInstance, address: string): string => {
  switch (instance.name) {
    case "Local":
      return `http://${scriptHostname()}:3000/${address}`
    case "Staging":
      return `https://staging.pay.galoy.io/${address}`
    case "BBW":
      return `https://pay.bbw.sv/${address}`
    case "Custom":
      return "Unknown"
  }
}

export const getPrintableQrCodeUrl = (
  instance: GaloyInstance,
  address: string,
): string => {
  switch (instance.name) {
    case "Local":
      return `http://${scriptHostname()}:3000/${address}/print`
    case "Staging":
      return `https://pay.staging.galoy.io/${address}/print`
    case "BBW":
      return `https://pay.bbw.sv/${address}/print`
    case "Custom":
      return "Unsupp"
  }
}

export const getLightningAddress = (instance: GaloyInstance, address: string): string => {
  switch (instance.name) {
    case "Local":
      return `${address}@${scriptHostname()}:3000`
    case "Staging":
      return `${address}@pay.staging.galoy.io`
    case "BBW":
      return `${address}@pay.bbw.sv`
    case "Custom":
      return "Unknown"
  }
}
