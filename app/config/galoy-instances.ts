import { INetwork } from "@app/types/network"
import { scriptHostname } from "@app/utils/helper"

export type GaloyInstance = {
  name: "BBW" | "Staging" | "Local"
  network: INetwork
  graphqlUri: string
  graphqlWsUri: string
}

export const GALOY_INSTANCES: GaloyInstance[] = [
  {
    name: "BBW",
    network: "mainnet",
    graphqlUri: "https://api.mainnet.galoy.io/graphql",
    graphqlWsUri: "wss://api.mainnet.galoy.io/graphql",
  },
  {
    name: "Staging",
    network: "signet",
    graphqlUri: "https://api.staging.galoy.io/graphql",
    graphqlWsUri: "wss://api.staging.galoy.io/graphql",
  },
  {
    name: "Local",
    network: "regtest",
    graphqlUri: `http://${scriptHostname()}:4002/graphql`,
    graphqlWsUri: `ws://${scriptHostname()}:4002/graphql`,
  },
]
