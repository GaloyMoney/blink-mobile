import { saveString, loadString, remove } from "./storage"
const  jwtDecode = require('jwt-decode')
import { GRAPHQL_REGTEST_URI } from 'react-native-dotenv'
import { GRAPHQL_TESTNET_URI } from 'react-native-dotenv'
import { GRAPHQL_MAINNET_URI } from 'react-native-dotenv'
import { loadNetwork } from "./network"

export const TOKEN_KEY = "GaloyToken"

// Singleton class
export class Token {
  mem_token = null

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
    this.mem_token = await loadString(TOKEN_KEY)
    console.log({mem_token: this.mem_token})
    return this.mem_token
  }

  async delete () {
    this.mem_token = null
    remove(TOKEN_KEY)
  }

  has () {
    return this.mem_token !== null
    // TODO check
  }

  get uid () {
    try {
      const { uid } = jwtDecode(this.mem_token)
      console.tron.log({uid})
      return uid
    } catch (err) {
      console.tron.log(err.toString())
      return null
    }
  }

  get network () {
    try {
      console.tron.log(this.mem_token)
      const { network } = jwtDecode(this.mem_token)
      console.tron.log({network})
      return network
    } catch (err) {
      console.tron.log(err.toString())
      return null
    }
  }

  get bearerString() {
    return this.has() ? `Bearer ${this.mem_token}` : ''
  }
}

export const getNetwork = async () => {
  if (new Token().has()) {
    return new Token().network
  } else {
    return await loadNetwork()
  }
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
      console.tron.log("no network test")
      return "none"
  }
}
