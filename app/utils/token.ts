import { saveString, loadString, remove } from "./storage"
const  jwtDecode = require('jwt-decode')
import { loadNetwork } from "./network"
import analytics from '@react-native-firebase/analytics'
import { scriptHostname } from "./helper"

// key used to stored the token within the phone
export const TOKEN_KEY = "GaloyToken"

const GRAPHQL_REGTEST_URI = `http://${scriptHostname()}:4000/graphql`
const GRAPHQL_TESTNET_URI = "https://graphql.testnet.galoy.io/graphql"
const GRAPHQL_MAINNET_URI = "https://graphql.mainnet.galoy.io/graphql"

// Singleton class
export class Token {
  private mem_token = null

  constructor() {
    const instance = this.constructor.instance;
    if (instance) {
        return instance;
    }

    this.constructor.instance = this;
  }

  async save({token}) {
    this.mem_token = token
    return await saveString(TOKEN_KEY, token)
  }

  async load (){
    // TODO: replace with secure storage
    this.mem_token = await loadString(TOKEN_KEY)
    analytics().setUserId(this.uid)
    return this.mem_token
  }

  async remove () {
    this.mem_token = null
    remove(TOKEN_KEY)
  }

  has () {
    return this.mem_token !== null
    // TODO check
  }

  get uid (): string | null {
    try {
      const { uid } = jwtDecode(this.mem_token)
      console.log({uid})
      return uid
    } catch (err) {
      console.log(err.toString())
      return null
    }
  }

  get network () {
    try {
      const { network } = jwtDecode(this.mem_token)
      return network
    } catch (err) {
      console.log(err.toString())
      return null
    }
  }

  get bearerString() {
    return this.has() ? `Bearer ${this.mem_token}` : ''
  }
}

export const getNetwork = async () => {
  let network 
  if (new Token().has()) {
    network = new Token().network
  } else {
    network = await loadNetwork()
  }
  analytics().setUserProperties({network})
  return network
}

export const getGraphQlUri = async () => {
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
