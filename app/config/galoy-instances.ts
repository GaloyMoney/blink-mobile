import { scriptHostname } from "@app/utils/helper"

export type GaloyInstanceNames = "BBW" | "Staging" | "Local" | "Custom"
export type GaloyInstance = {
  name: GaloyInstanceNames
  graphqlUri: string
  graphqlWsUri: string
}

export const GALOY_INSTANCES: GaloyInstance[] = [
  {
    name: "BBW",
    graphqlUri: "https://api.mainnet.galoy.io/graphql",
    graphqlWsUri: "wss://api.mainnet.galoy.io/graphql",
  },
  {
    name: "Staging",
    graphqlUri: "https://api.staging.galoy.io/graphql",
    graphqlWsUri: "wss://api.staging.galoy.io/graphql",
  },
  {
    name: "Local",
    graphqlUri: `http://${scriptHostname()}:4002/graphql`,
    graphqlWsUri: `ws://${scriptHostname()}:4002/graphql`,
  },
]
