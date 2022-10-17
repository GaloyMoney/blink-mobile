import { INetwork } from "@app/types/network"
import { scriptHostname } from "./helper"

// TODO: Return all of these values from the API?

export const getPosUrl = (network: INetwork, address: string): string => {
  switch (network) {
    case "regtest":
      return `http://${scriptHostname()}:3000/${address}`
    case "testnet":
      return `https://staging.pay.galoy.io/${address}`
    case "mainnet":
      return `https://pay.bbw.sv/${address}`
  }
}

export const getPrintableQrCodeUrl = (network: INetwork, address: string): string => {
  switch (network) {
    case "regtest":
      return `http://${scriptHostname()}:3000/${address}/print`
    case "testnet":
      return `https://pay.staging.galoy.io/${address}/print`
    case "mainnet":
      return `https://pay.bbw.sv/${address}/print`
  }
}

export const getLightningAddress = (network: INetwork, address: string): string => {
  switch (network) {
    case "regtest":
      return `${address}@${scriptHostname()}:3000`
    case "testnet":
      return `${address}@pay.staging.galoy.io`
    case "mainnet":
      return `${address}@bbw.sv`
  }
}
