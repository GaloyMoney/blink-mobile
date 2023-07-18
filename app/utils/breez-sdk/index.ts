/* eslint-disable @typescript-eslint/no-explicit-any */
import { INVITE_CODE, API_KEY } from "@env"
import {
  defaultConfig,
  EnvironmentType,
  connect,
  mnemonicToSeed,
  NodeConfig,
  NodeConfigType,
} from "@breeztech/react-native-breez-sdk"
import * as bip39 from "bip39"

// Retry function
const retry = (fn: () => Promise<void>, ms: number | undefined, maxRetries: number) =>
  new Promise((resolve, reject) => {
    let attempts = 0
    const tryFn = async () => {
      try {
        const result = await fn()
        resolve(result)
      } catch (err) {
        // eslint-disable-next-line no-plusplus
        if (attempts++ >= maxRetries) {
          reject(err)
        } else {
          setTimeout(tryFn, ms)
        }
      }
    }
    tryFn()
  })

// Connect function
const connectToSDK = async () => {
  try {
    // Create the default config
    const mnemonic = bip39.generateMnemonic(128)
    const seed = await mnemonicToSeed(mnemonic)
    const inviteCode = INVITE_CODE
    const nodeConfig: NodeConfig = {
      type: NodeConfigType.GREENLIGHT,
      config: {
        inviteCode,
      },
    }
    const config = await defaultConfig(EnvironmentType.PRODUCTION, API_KEY, nodeConfig)
    // Customize the config object according to your needs
    // config.workingDir = "./"

    // Connect to the Breez SDK make it ready for use

    try {
      console.log("starting connect")
      const sdkServices: any = await connect(config, seed)
      console.log("finished connect")
      console.log("connected to breez sdk", sdkServices)
    } catch (error) {
      console.log(error)
    }
  } catch (error) {
    console.log("connect error", error)
  }
}

// Connect function with retries
async function connectBreezSDK(): Promise<any> {
  try {
    console.log("connecting to breez sdk")
    const sdkServices = await retry(connectToSDK, 5000, 3)
    console.log("connected to breez sdk", sdkServices)
    return sdkServices
  } catch (error: any) {
    const errorMsg = "Failed to connect to Breez SDK after 3 attempts"
    console.log(errorMsg, error)
    throw new Error(`${errorMsg}: ${error.message}`)
  }
}

let breezSDKInitialized = false
let breezSDKInitializing: Promise<boolean> | null = null

export async function initializeBreezSDK(): Promise<boolean> {
  if (breezSDKInitialized) {
    console.log("BreezSDK already initialized")
    return false
  }

  if (breezSDKInitializing !== null) {
    console.log("BreezSDK initialization in progress")
    return breezSDKInitializing
  }

  breezSDKInitializing = (async () => {
    try {
      await retry(connectToSDK, 5000, 3)
      breezSDKInitialized = true
      return true
    } catch (error: any) {
      const errorMsg = "Failed to connect to Breez SDK after 3 attempts"
      if (error instanceof Error) {
        console.error(`${errorMsg}: ${error.message}`)
        throw new Error(`${errorMsg}: ${error.message}`)
      } else {
        // If it's not an error instance, we just throw it again
        throw error
      }
    } finally {
      breezSDKInitializing = null
    }
  })()

  return breezSDKInitializing
}

export default connectBreezSDK
