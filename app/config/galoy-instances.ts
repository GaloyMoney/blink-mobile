import { scriptHostname } from "@app/utils/helper"

export type GaloyInstanceNames = "BBW" | "Staging" | "Local" | "Custom"
export type GaloyInstance = {
  name: GaloyInstanceNames
  graphqlUri: string
  graphqlWsUri: string
  posUrl: string
  lnAddressHostname: string
}

export const bankName = "BBW"

export const GALOY_INSTANCES: GaloyInstance[] = [
  {
    name: "BBW",
    graphqlUri: "https://api.mainnet.galoy.io/graphql",
    graphqlWsUri: "wss://api.mainnet.galoy.io/graphql",
    posUrl: "https://pay.bbw.sv",
    lnAddressHostname: "pay.bbw.sv",
  },
  {
    name: "Staging",
    graphqlUri: "https://api.staging.galoy.io/graphql",
    graphqlWsUri: "wss://api.staging.galoy.io/graphql",
    posUrl: "https://pay.staging.galoy.io",
    lnAddressHostname: "pay.staging.galoy.io",
  },
  {
    name: "Local",
    graphqlUri: `http://${scriptHostname()}:4002/graphql`,
    graphqlWsUri: `ws://${scriptHostname()}:4002/graphql`,
    posUrl: `http://${scriptHostname()}:3000`,
    lnAddressHostname: `${scriptHostname()}:3000`,
  },
]
