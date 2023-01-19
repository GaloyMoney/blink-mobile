import { Network } from "@app/graphql/generated"

export const isDestinationLightningPayment = (destination: string): boolean => {
  return (
    destination.toLocaleLowerCase().startsWith("lnbc") ||
    destination.toLocaleLowerCase().startsWith("lntb")
  )
}

export const isDestinationNetworkValid = (
  destination: string,
  network: Network,
): boolean => {
  return (
    (network === "signet" && destination.toLowerCase().startsWith("lntb")) ||
    (network === "mainnet" && destination.toLowerCase().startsWith("lnbc"))
  )
}
