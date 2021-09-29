import { saveString, loadString, remove } from "./storage"

import type { INetwork } from "../types/network"
import { scriptHostname } from "./helper"

export const NETWORK_STRING = "NETWORK_STRING"

const GRAPHQL_REGTEST_URI = `http://${scriptHostname()}:4000/graphql`
const GRAPHQL_TESTNET_URI = "https://graphql.testnet.galoy.io/graphql"
const GRAPHQL_MAINNET_URI = "https://graphql.mainnet.galoy.io/graphql"

const GRAPHQL_V2_REGTEST_URI = `http://${scriptHostname()}:4002/graphql`
const GRAPHQL_V2_TESTNET_URI = "https://api.testnet.galoy.io/graphql"
const GRAPHQL_V2_MAINNET_URI = "https://api.mainnet.galoy.io/graphql"

// FIXME: no longer need since we switch from mst-gql to apollo-client

// this is stored independantly of Rootstore because
// the URI / server need to be set when creating the
// rootStore. therefore we are loading this before
// loading the main RootStore file

export const loadNetwork = async (): Promise<INetwork> =>
  ((await loadString(NETWORK_STRING)) ?? "mainnet") as INetwork

export const saveNetwork = async (network: INetwork): Promise<boolean> =>
  saveString(NETWORK_STRING, network)

export const removeNetwork = async (): Promise<void> => {
  remove(NETWORK_STRING)
}

export const getGraphQLUri = (network: INetwork): string => {
  switch (network) {
    case "regtest":
      return GRAPHQL_REGTEST_URI
    case "testnet":
      return GRAPHQL_TESTNET_URI
    case "mainnet":
      return GRAPHQL_MAINNET_URI
    default:
      console.log("no network set")
      return "none"
  }
}

export const getGraphQLV2Uri = async (network: INetwork): Promise<string> => {
  switch (network) {
    case "regtest":
      return GRAPHQL_V2_REGTEST_URI
    case "testnet":
      return GRAPHQL_V2_TESTNET_URI
    case "mainnet":
      return GRAPHQL_V2_MAINNET_URI
    default:
      console.log("no network set")
      return "none"
  }
}
