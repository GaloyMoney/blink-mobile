import { NativeModules } from "react-native"

// this is used for local development
// will typically return localhost
const scriptHostname = (): string => {
  const { scriptURL } = NativeModules.SourceCode
  const scriptHostname = scriptURL?.split("://")[1].split(":")[0] ?? ""
  return scriptHostname
}

export const possibleGaloyInstanceNames = [
  "Main",
  "Staging",
  "Test",
  "Development",
  "Local",
  "Custom",
] as const
export type GaloyInstanceName = (typeof possibleGaloyInstanceNames)[number]

export type StandardInstance = {
  id: "Main" | "Staging" | "Test" | "Development" | "Local"
}

export type CustomInstance = {
  id: "Custom"
  name: string
  graphqlUri: string
  graphqlWsUri: string
  authUrl: string
  posUrl: string
  lnAddressHostname: string
  blockExplorer: string
  relayUrl: string
}

export type GaloyInstanceInput = StandardInstance | CustomInstance

export type GaloyInstance = {
  id: GaloyInstanceName
  name: string
  graphqlUri: string
  graphqlWsUri: string
  authUrl: string
  posUrl: string
  lnAddressHostname: string
  blockExplorer: string
  relayUrl: string
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
    name: "Flash",
    graphqlUri: "https://api.flashapp.me/graphql",
    graphqlWsUri: "wss://ws.flashapp.me/graphql",
    authUrl: "https://api.flashapp.me",
    posUrl: "https://pay.flashapp.me",
    lnAddressHostname: "flashapp.me",
    relayUrl: "wss://relay.flashapp.me",
    blockExplorer: "https://mempool.space/tx/",
  },
  {
    id: "Staging",
    name: "Staging",
    graphqlUri: "https://api.staging.flashapp.me/graphql",
    graphqlWsUri: "wss://ws.staging.flashapp.me/graphql",
    authUrl: "https://api.staging.flashapp.me",
    posUrl: "http://pay.staging.flashapp.me",
    lnAddressHostname: "staging.flashapp.me",
    blockExplorer: "https://mempool.space/signet/tx/",
    relayUrl: "wss://relay.test.flashapp.me",
  },
  {
    id: "Test",
    name: "Test",
    graphqlUri: "https://api.test.flashapp.me/graphql",
    graphqlWsUri: "wss://ws.test.flashapp.me/graphql",
    authUrl: "https://api.test.flashapp.me",
    posUrl: "http://pay.test.flashapp.me",
    lnAddressHostname: "test.flashapp.me",
    blockExplorer: "https://mempool.space/signet/tx/",
    relayUrl: "wss://relay.test.flashapp.me",
  },
  {
    id: "Development",
    name: "Development",
    graphqlUri: "https://api.development.flashapp.me:8080/graphql",
    graphqlWsUri: "ws://ws.development.flashapp.me:4000/graphql",
    authUrl: "https://api.development.flashapp.me:8080",
    posUrl: "http://development.flashapp.me:3000",
    lnAddressHostname: "development.flashapp.me:3000",
    blockExplorer: "https://mempool.space/signet/tx/",
    relayUrl: "wss://relay.test.flashapp.me",
  },
  {
    id: "Local",
    name: "Local",
    graphqlUri: `http://${scriptHostname()}:4002/graphql`,
    graphqlWsUri: `ws://${scriptHostname()}:4002/graphqlws`,
    authUrl: `http://${scriptHostname()}:4002`,
    posUrl: `http://${scriptHostname()}:3000`,
    lnAddressHostname: `${scriptHostname()}:3000`,
    blockExplorer: "https://mempool.space/signet/tx/",
    relayUrl: "wss://relay.test.flashapp.me",
  },
] as const
