import { saveString, loadString, remove } from "./storage"

import type { INetwork } from "../types/network"

export const NETWORK_STRING = "NETWORK_STRING"

// FIXME: no longer need since we switch from mst-gql to apollo-client

// this is stored independantly of Rootstore because
// the URI / server need to be set when creating the
// rootStore. therefore we are loading this before
// loading the main RootStore file

export const loadNetwork = async (): Promise<string> =>
  (await loadString(NETWORK_STRING)) ?? "mainnet"

export const saveNetwork = async (network: INetwork): Promise<boolean> =>
  saveString(NETWORK_STRING, network)

export const removeNetwork = async (): Promise<void> => {
  remove(NETWORK_STRING)
}
