import { INVITE_CODE, MNEMONIC_WORDS, API_KEY } from "@env"
import {
  defaultConfig,
  EnvironmentType,
  connect,
  mnemonicToSeed,
  NodeConfig,
  NodeConfigType,
} from "@breeztech/react-native-breez-sdk"
import * as bip39 from "bip39"
import * as Keychain from "react-native-keychain"

const KEYCHAIN_MNEMONIC_KEY = "mnemonic_key"

// Retry function
const retry = <T>(fn: () => Promise<T>, ms = 5000, maxRetries = 3) =>
  new Promise<T>((resolve, reject) => {
    let attempts = 0
    const tryFn = async () => {
      try {
        const result = await fn()
        resolve(result)
      } catch (err) {
        // eslint-disable-next-line no-plusplus
        if (++attempts >= maxRetries) {
          reject(err)
        } else {
          setTimeout(tryFn, ms)
        }
      }
    }
    tryFn()
  })

const getMnemonic = async (): Promise<string> => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: KEYCHAIN_MNEMONIC_KEY,
    })
    if (credentials) {
      return credentials.password
    }

    // Generate mnemonic and store it in the keychain
    // For development, we use a fixed mnemonic stored in .env
    const mnemonic = MNEMONIC_WORDS // bip39.generateMnemonic(128)
    await Keychain.setGenericPassword(KEYCHAIN_MNEMONIC_KEY, mnemonic, {
      service: KEYCHAIN_MNEMONIC_KEY,
    })
    return mnemonic
  } catch (error) {
    console.error("Error in getMnemonic: ", error)
    throw error
  }
}

const connectToSDK = async () => {
  try {
    const mnemonic = await getMnemonic()
    console.log("Mnemonic: ", mnemonic)
    const seed = await mnemonicToSeed(mnemonic)
    const inviteCode = INVITE_CODE
    const nodeConfig: NodeConfig = {
      type: NodeConfigType.GREENLIGHT,
      config: {
        inviteCode,
      },
    }
    const config = await defaultConfig(EnvironmentType.PRODUCTION, API_KEY, nodeConfig)

    console.log("Starting connection to Breez SDK")
    await connect(config, seed)
    console.log("Finished connection to Breez SDK")
  } catch (error) {
    console.error("Connect error: ", error)
    throw error
  }
}

let breezSDKInitialized = false
let breezSDKInitializing: Promise<void | boolean> | null = null

export const initializeBreezSDK = async (): Promise<boolean> => {
  if (breezSDKInitialized) {
    console.log("BreezSDK already initialized")
    return false
  }

  if (breezSDKInitializing !== null) {
    console.log("BreezSDK initialization in progress")
    return breezSDKInitializing as Promise<boolean>
  }

  breezSDKInitializing = (async () => {
    try {
      await retry(connectToSDK, 5000, 3)
      breezSDKInitialized = true
      return true
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Failed to connect to Breez SDK after 3 attempts: ", error.message)
      throw new Error(`Failed to connect to Breez SDK after 3 attempts: ${error.message}`)
    } finally {
      breezSDKInitializing = null
    }
  })()

  return breezSDKInitializing as Promise<boolean>
}

export default initializeBreezSDK
