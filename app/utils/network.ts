import { saveString, loadString, remove } from "./storage"

export const NETWORK_STRING = "NETWORK_STRING"

// TODO: integrate in rootstore instead

export const loadNetwork = async () => {
  return (await loadString(NETWORK_STRING) ?? "mainnet")
}

export const saveNetwork = async (network) => {
  return await saveString(NETWORK_STRING, network)
}

export const removeNetwork = async () => {
  remove(NETWORK_STRING)
}