import { INetwork } from "@app/types/network"
import { scriptHostname } from "@app/utils/helper"

const GRAPHQL_REGTEST_URI = `http://${scriptHostname()}:4002/graphql`
const GRAPHQL_TESTNET_URI = "https://api.pvbtc1.staging.pvbtc.cloud/graphql"
const GRAPHQL_MAINNET_URI = "https://api.production.pvbtc.cloud/graphql"

const GRAPHQL_REGTEST_WS_URI = `ws://${scriptHostname()}:4002/graphql`
const GRAPHQL_TESTNET_WS_URI = "wss://api.pvbtc1.staging.pvbtc.cloud/graphql"
const GRAPHQL_MAINNET_WS_URI = "wss://api.production.pvbtc.cloud/graphql"

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
