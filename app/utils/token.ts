import analytics from "@react-native-firebase/analytics"
import jwtDecode from "jwt-decode"
import { saveString, loadString, remove } from "./storage"
import { loadNetwork } from "./network"
import { scriptHostname } from "./helper"

import type { INetwork } from "../types/network"

// key used to stored the token within the phone
export const TOKEN_KEY = "GaloyToken"

const GRAPHQL_REGTEST_URI = `http://${scriptHostname()}:4000/graphql`
const GRAPHQL_TESTNET_URI = "https://graphql.testnet.galoy.io/graphql"
const GRAPHQL_MAINNET_URI = "https://graphql.mainnet.galoy.io/graphql"

const GRAPHQL_V2_REGTEST_URI = `http://${scriptHostname()}:4002/graphql`
const GRAPHQL_V2_TESTNET_URI = "https://api.testnet.galoy.io/graphql"
const GRAPHQL_V2_MAINNET_URI = "https://api.mainnet.galoy.io/graphql"

type JwtPayload = {
  uid: string
  network: INetwork
}

// Singleton class
export class Token {
  private mem_token = null
  private static _instance: Token = new Token()

  constructor() {
    if (Token._instance) {
      throw Error("Error: Instantiation failed: Use Token.getInstance() instead of new.")
    }
    Token._instance = this
  }

  public static getInstance(): Token {
    return Token._instance
  }

  async save(token: string): Promise<boolean> {
    this.mem_token = token
    return saveString(TOKEN_KEY, token)
  }

  async load(): Promise<string> {
    // TODO: replace with secure storage
    this.mem_token = await loadString(TOKEN_KEY)
    analytics().setUserId(this.uid)
    return this.mem_token
  }

  async remove(): Promise<void> {
    this.mem_token = null
    remove(TOKEN_KEY)
  }

  has(): boolean {
    return this.mem_token !== null
    // TODO check
  }

  get uid(): string | null {
    try {
      const { uid } = jwtDecode<JwtPayload>(this.mem_token)
      console.log({ uid })
      return uid
    } catch (err) {
      console.log(err.toString())
      return null
    }
  }

  get network(): INetwork | null {
    try {
      const { network } = jwtDecode<JwtPayload>(this.mem_token)
      return network
    } catch (err) {
      console.log(err.toString())
      return null
    }
  }

  get bearerString(): string {
    return this.has() ? `Bearer ${this.mem_token}` : ""
  }
}

export const getNetwork = async (): Promise<INetwork> => {
  let network
  if (Token.getInstance().has()) {
    network = Token.getInstance().network
  } else {
    network = await loadNetwork()
  }
  analytics().setUserProperties({ network })
  return network
}

export const getGraphQLUri = async (): Promise<string> => {
  const network = await getNetwork()
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

export const getGraphQLV2Uri = async (): Promise<string> => {
  const network = await getNetwork()
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
