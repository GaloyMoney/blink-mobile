import { scriptHostname } from "@app/utils/helper"
import { GRAPHQL_TESTNET_URI,GRAPHQL_TESTNET_WS_URI } from "@app/modules/market-place/config"

export type GaloyInstanceNames = "BBW" | "Staging" | "Local" | "Custom"
export type GaloyInstance = {
  name: GaloyInstanceNames
  graphqlUri: string
  graphqlWsUri: string
  posUrl: string
  lnAddressHostname: string
}
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
    graphqlUri: GRAPHQL_TESTNET_URI,
    graphqlWsUri: GRAPHQL_TESTNET_WS_URI,
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