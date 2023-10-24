import { INVITE_CODE, MNEMONIC_WORDS, API_KEY } from "@env"
import * as sdk from "@breeztech/react-native-breez-sdk"
import * as bip39 from "bip39"
import * as Keychain from "react-native-keychain"

const KEYCHAIN_MNEMONIC_KEY = "mnemonic_key"

// Retry function
const retry = <T>(fn: () => Promise<T>, ms = 15000, maxRetries = 3) =>
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    const mnemonic = bip39.generateMnemonic(128)
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
    const mnemonic = MNEMONIC_WORDS // await getMnemonic()
    // console.log("Mnemonic: ", mnemonic)
    const seed = await sdk.mnemonicToSeed(mnemonic)
    const inviteCode = INVITE_CODE
    const nodeConfig: sdk.NodeConfig = {
      type: sdk.NodeConfigType.GREENLIGHT,
      config: {
        inviteCode,
      },
    }
    const config = await sdk.defaultConfig(
      sdk.EnvironmentType.PRODUCTION,
      API_KEY,
      nodeConfig,
    )

    console.log("Starting connection to Breez SDK")
    await sdk.connect(config, seed)
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

export const receivePaymentBreezSDK = async (
  paymentRequest: sdk.ReceivePaymentRequest,
): Promise<sdk.ReceivePaymentResponse> => {
  try {
    const invoice = await sdk.receivePayment(paymentRequest)
    return invoice
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const sendPaymentBreezSDK = async (
  paymentRequest: string,
  paymentAmount?: number,
): Promise<sdk.Payment> => {
  try {
    const payment = await sdk.sendPayment(paymentRequest, paymentAmount)
    return payment
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const sendNoAmountPaymentBreezSDK = async (
  paymentRequest: string,
): Promise<sdk.Payment> => {
  console.log("Stepping into Sending payment with no amount function")
  try {
    console.log("Trying to send payment with no amount")
    const payment = await sdk.sendPayment(paymentRequest)
    if (payment.paymentType === null) {
      console.log("Payment type is null, replacing with LN payment")
      payment.paymentType = sdk.PaymentType.SEND
    }
    return payment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error.message, error.stack)
    throw error
  }
}

export const parseInvoiceBreezSDK = async (
  paymentRequest: string,
): Promise<sdk.LnInvoice> => {
  try {
    const invoice = await sdk.parseInvoice(paymentRequest)
    return invoice
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const receiveOnchainBreezSDK = async (
  onChainRequest: sdk.ReceiveOnchainRequest,
): Promise<sdk.SwapInfo> => {
  try {
    const swapInfo = await sdk.receiveOnchain(onChainRequest)
    return swapInfo
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const fetchReverseSwapFeesBreezSDK = async (
  reverseSwapfeeRequest: sdk.ReverseSwapFeesRequest,
): Promise<sdk.ReverseSwapPairInfo> => {
  try {
    const fees = await sdk.fetchReverseSwapFees(reverseSwapfeeRequest)
    return fees
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const sendOnchainBreezSDK = async (
  currentFees: sdk.ReverseSwapPairInfo,
  destinationAddress: string,
  satPerVbyte: number,
): Promise<sdk.ReverseSwapInfo> => {
  try {
    console.log("Sending onchain payment to address: ", destinationAddress)
    const reverseSwapInfo = await sdk.sendOnchain(
      currentFees.min,
      destinationAddress,
      currentFees.feesHash,
      satPerVbyte,
    )
    return reverseSwapInfo
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const recommendedFeesBreezSDK = async (): Promise<sdk.RecommendedFees> => {
  try {
    console.log("Fetching recommended fees")
    const fees = await sdk.recommendedFees()
    return fees
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const payLnurlBreezSDK = async (
  lnurl: string,
  amount: number,
): Promise<sdk.LnUrlPayResult> => {
  try {
    let output: sdk.LnUrlPayResult
    const input: sdk.InputResponse = await sdk.parseInput(lnurl)
    if (input.type === sdk.InputType.LNURL_PAY) {
      const amountSats: number =
        amount > input.data.minSendable ? amount : input.data.minSendable
      const result = await sdk.payLnurl(
        input.data,
        amountSats,
        "Flash Cash LNURL Payment",
      )
      output = result
    } else {
      return {
        type: sdk.LnUrlPayResultType.ENDPOINT_ERROR,
        data: input.data.reason,
      }
    }
    return output
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const listRefundablesBreezSDK = async (): Promise<sdk.SwapInfo[]> => {
  try {
    const refundables = await sdk.listRefundables()
    console.log("Refundables: ", JSON.stringify(refundables, null, 2))
    return refundables
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const nodeInfoBreezSDK = async (): Promise<sdk.NodeState> => {
  try {
    const info = await sdk.nodeInfo()
    console.log("Node info: ", JSON.stringify(info, null, 2))
    return info
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const listPaymentsBreezSDK = async (): Promise<sdk.Payment[]> => {
  try {
    const filter: sdk.PaymentTypeFilter = sdk.PaymentTypeFilter.ALL
    const payments = await sdk.listPayments(filter)
    // console.log("Payments: ", payments)
    return payments
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const addLogListenerBreezSDK = async (): Promise<void> => {
  try {
    const listener: sdk.LogEntryFn = (l: sdk.LogEntry) => {
      console.log("BreezSDK log: ", l)
    }
    await sdk.addLogListener(listener)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const executeDevCommandBreezSDK = async (command: string): Promise<void> => {
  try {
    const res = await sdk.executeDevCommand(command)
    console.log("Executed dev command: ", res)
  } catch (error) {
    console.log(error)
    throw error
  }
}
