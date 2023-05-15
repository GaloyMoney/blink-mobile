import { PURAVIDA_GRAPHQL_MAINNET_URI, PURAVIDA_GRAPHQL_MAINNET_WS_URI, PURAVIDA_GRAPHQL_TESTNET_URI,PURAVIDA_GRAPHQL_TESTNET_WS_URI, PURAVIDA_LN_ADDRESS, PURAVIDA_LN_MAINNET_ADDRESS, PURAVIDA_POS_MAINNET_URL, PURAVIDA_POS_URL } from "@app/modules/market-place/config"
import { NativeModules } from "react-native"

// this is used for local development
// will typically return localhost
const scriptHostname = (): string => {
  const { scriptURL } = NativeModules.SourceCode
  const scriptHostname = scriptURL?.split("://")[1].split(":")[0] ?? ""
  return scriptHostname
}

export const possibleGaloyInstanceNames = ["Main", "Staging", "Local", "Custom"] as const
export type GaloyInstanceName = (typeof possibleGaloyInstanceNames)[number]

export type StandardInstance = {
  id: "Main" | "Staging" | "Local"
}

export type CustomInstance = {
  id: "Custom"
  name: string
  graphqlUri: string
  graphqlWsUri: string
  posUrl: string
  lnAddressHostname: string
  blockExplorer: string
}

export type GaloyInstanceInput = StandardInstance | CustomInstance

export type GaloyInstance = {
  id: GaloyInstanceName
  name: string
  graphqlUri: string
  graphqlWsUri: string
  posUrl: string
  lnAddressHostname: string
  blockExplorer: string
}

export const resolveGaloyInstanceOrDefault = (
  input: GaloyInstanceInput,
): GaloyInstance => {
  if (input.id === "Custom") {
    return input
  }

  const instance = GALOY_INSTANCES.find((instance) => instance.id === input.id)

  // branch only to please typescript. Array,find have T | undefined as return type
  if (instance === undefined) {
    console.error("instance not found") // should not happen
    return GALOY_INSTANCES[0]
  }

  return instance
}


export const GALOY_INSTANCES: readonly GaloyInstance[] = [
  {
    id: "Main",
    name: "PVW",
    graphqlUri: PURAVIDA_GRAPHQL_MAINNET_URI,
    graphqlWsUri: PURAVIDA_GRAPHQL_MAINNET_WS_URI,
    posUrl: PURAVIDA_POS_MAINNET_URL,
    lnAddressHostname: PURAVIDA_LN_MAINNET_ADDRESS,
    blockExplorer: "https://mempool.space/tx/",
  },
  {
    id: "Staging",
    name: "Staging",
    graphqlUri: PURAVIDA_GRAPHQL_TESTNET_URI,
    graphqlWsUri: PURAVIDA_GRAPHQL_TESTNET_WS_URI,
    posUrl: PURAVIDA_POS_URL,
    lnAddressHostname: PURAVIDA_LN_ADDRESS,
    blockExplorer: "https://mempool.space/signet/tx/",
  },
  {
    id: "Local",
    name: "Local",
    graphqlUri: `http://${scriptHostname()}:4002/graphql`,
    graphqlWsUri: `ws://${scriptHostname()}:4002/graphql`,
    posUrl: `http://${scriptHostname()}:3000`,
    lnAddressHostname: `${scriptHostname()}:3000`,
    blockExplorer: "https://mempool.space/signet/tx/",
  },
] as const