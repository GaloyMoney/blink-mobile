import { INetwork } from "@app/types/network"

export const isDestinationLightningPayment = (destination: string): boolean => {
  return (
    destination.toLocaleLowerCase().startsWith("lnbc") ||
    destination.toLocaleLowerCase().startsWith("lntb")
  )
}

export const isDestinationNetworkValid = (
  destination: string,
  network: INetwork,
): boolean => {
  return (
    (network === "signet" && destination.toLowerCase().startsWith("lntb")) ||
    (network === "mainnet" && destination.toLowerCase().startsWith("lnbc"))
  )
}
