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
    name: "BBW",
    graphqlUri: "https://api.mainnet.galoy.io/graphql",
    graphqlWsUri: "wss://api.mainnet.galoy.io/graphql",
    posUrl: "https://pay.bbw.sv",
    lnAddressHostname: "pay.bbw.sv",
    blockExplorer: "https://mempool.space/tx/",
  },
  {
    id: "Staging",
    name: "Staging",
    graphqlUri: "https://api.staging.galoy.io/graphql",
    graphqlWsUri: "wss://api.staging.galoy.io/graphql",
    posUrl: "https://pay.staging.galoy.io",
    lnAddressHostname: "pay.staging.galoy.io",
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
