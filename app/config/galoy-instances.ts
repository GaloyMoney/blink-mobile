import { scriptHostname } from "@app/utils/helper"
import { PURAVIDA_GRAPHQL_MAINNET_URI, PURAVIDA_GRAPHQL_MAINNET_WS_URI, PURAVIDA_GRAPHQL_TESTNET_URI,PURAVIDA_GRAPHQL_TESTNET_WS_URI, PURAVIDA_LN_ADDRESS, PURAVIDA_LN_MAINNET_ADDRESS, PURAVIDA_POS_MAINNET_URL, PURAVIDA_POS_URL } from "@app/modules/market-place/config"

export type GaloyInstanceNames = "PVW" | "Staging" | "Local" | "Custom"
export type GaloyInstance = {
  name: GaloyInstanceNames
  graphqlUri: string
  graphqlWsUri: string
  posUrl: string
  lnAddressHostname: string
}
export const GALOY_INSTANCES: GaloyInstance[] = [
  {
    name: "PVW",
    graphqlUri: PURAVIDA_GRAPHQL_MAINNET_URI,
    graphqlWsUri: PURAVIDA_GRAPHQL_MAINNET_WS_URI,
    posUrl: PURAVIDA_POS_MAINNET_URL,
    lnAddressHostname: PURAVIDA_LN_MAINNET_ADDRESS,
  },
  {
    name: "Staging",
    graphqlUri: PURAVIDA_GRAPHQL_TESTNET_URI,
    graphqlWsUri: PURAVIDA_GRAPHQL_TESTNET_WS_URI,
    posUrl: PURAVIDA_POS_URL,
    lnAddressHostname: PURAVIDA_LN_ADDRESS,
  },
  {
    name: "Local",
    graphqlUri: `http://${scriptHostname()}:4002/graphql`,
    graphqlWsUri: `ws://${scriptHostname()}:4002/graphql`,
    posUrl: `http://${scriptHostname()}:3000`,
    lnAddressHostname: `${scriptHostname()}:3000`,
  },
]