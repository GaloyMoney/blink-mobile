import { scriptHostname } from "@app/utils/helper"

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

// export const GALOY_INSTANCES: GaloyInstance[] = [
//   {
//     name: "BBW",
//     network: "mainnet",
//     graphqlUri: GRAPHQL_MAINNET_URI,
//     graphqlWsUri: GRAPHQL_MAINNET_WS_URI,
//   },
//   {
//     name: "Staging",
//     network: "signet",
//     graphqlUri: GRAPHQL_TESTNET_URI,
//     graphqlWsUri: GRAPHQL_TESTNET_WS_URI,
//   },
//   {
//     name: "Local",
//     network: "regtest",
//     graphqlUri: GRAPHQL_REGTEST_URI,
//     graphqlWsUri: GRAPHQL_REGTEST_WS_URI,
//   },
// ]
