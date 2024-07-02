import { API_KEY, GREENLIGHT_PARTNER_CERT, GREENLIGHT_PARTNER_KEY } from "@env"
import * as sdk from "@breeztech/react-native-breez-sdk"
import * as bip39 from "bip39"
import * as Keychain from "react-native-keychain"
import { EventEmitter } from "events"
import { base64ToBytes, toMilliSatoshi } from "../conversion"
import RNFS from "react-native-fs"

const _GREENLIGHT_PARTNER_CERT: number[] = Array.from(
  base64ToBytes(GREENLIGHT_PARTNER_CERT),
)

const _GREENLIGHT_PARTNER_KEY: number[] = Array.from(
  base64ToBytes(GREENLIGHT_PARTNER_KEY),
)

const KEYCHAIN_MNEMONIC_KEY = "mnemonic_key"

// SDK events listener
export const paymentEvents = new EventEmitter()

paymentEvents.setMaxListeners(20) // Adjust the limit as needed

export const onBreezEvent = (event: sdk.BreezEvent) => {
  console.log(`received event ${event.type}`)
  if (event.type === "paymentSucceed") {
    paymentEvents.emit("paymentSuccess")
  } else if (event.type === "invoicePaid") {
    paymentEvents.emit("invoicePaid")
  } else if (event.type === "paymentFailed") {
    paymentEvents.emit("paymentFailure", new Error("Payment failed"))
  }
}

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
    console.log("Looking for mnemonic in keychain")
    const credentials = await Keychain.getInternetCredentials(KEYCHAIN_MNEMONIC_KEY)
    if (credentials) {
      console.log("Mnemonic found in keychain")
      return credentials.password
    }

    // Generate mnemonic and store it in the keychain
    // For development, we use a fixed mnemonic stored in .env
    console.log("Mnemonic not found in keychain. Generating new one")
    const mnemonic = bip39.generateMnemonic(128)
    await Keychain.setInternetCredentials(
      KEYCHAIN_MNEMONIC_KEY,
      KEYCHAIN_MNEMONIC_KEY,
      mnemonic,
    )
    // console.log("Mnemonic stored in keychain:", mnemonic)
    return mnemonic
  } catch (error) {
    console.error("Error in getMnemonic: ", error)
    throw error
  }
}

export const breezHealthCheck = async (): Promise<void> => {
  const healthCheck = await sdk.serviceHealthCheck()
  console.log(`Current service status is: ${healthCheck.status}`)
  if (!healthCheck.status) {
    throw new Error("Breez service is not available")
  }
}

const connectToSDK = async () => {
  try {
    const mnemonic = await getMnemonic() // MNEMONIC_WORDS
    // console.log("Connecting with mnemonic: ", mnemonic)
    const seed = await sdk.mnemonicToSeed(mnemonic)
    const nodeConfig: sdk.NodeConfig = {
      type: sdk.NodeConfigVariant.GREENLIGHT,
      config: {
        partnerCredentials: {
          deviceCert: _GREENLIGHT_PARTNER_CERT,
          deviceKey: _GREENLIGHT_PARTNER_KEY,
        },
      },
    }
    const config = await sdk.defaultConfig(
      sdk.EnvironmentType.PRODUCTION,
      API_KEY,
      nodeConfig,
    )

    // console.log("Starting connection to Breez SDK")
    await sdk.connect(config, seed, onBreezEvent)
    // console.log("Finished connection to Breez SDK")
  } catch (error) {
    console.error("Connect error: ", error)
    throw error
  }
}

export const disconnectToSDK = async () => {
  try {
    const nodeConfig: sdk.NodeConfig = {
      type: sdk.NodeConfigVariant.GREENLIGHT,
      config: {
        partnerCredentials: {
          deviceCert: _GREENLIGHT_PARTNER_CERT,
          deviceKey: _GREENLIGHT_PARTNER_KEY,
        },
      },
    }

    const config = await sdk.defaultConfig(
      sdk.EnvironmentType.PRODUCTION,
      API_KEY,
      nodeConfig,
    )

    await sdk.disconnect()
    await RNFS.unlink(config.workingDir)
    breezSDKInitialized = false
    breezSDKInitializing = null
  } catch (error) {
    console.error("Disconnect error: ", error)
    throw error
  }
}

export let breezSDKInitialized = false
let breezSDKInitializing: Promise<void | boolean> | null = null

export const initializeBreezSDK = async (): Promise<boolean> => {
  if (breezSDKInitialized) {
    // console.log("BreezSDK already initialized")
    return false
  }

  if (breezSDKInitializing !== null) {
    // console.log("BreezSDK initialization in progress")
    return breezSDKInitializing as Promise<boolean>
  }

  breezSDKInitializing = (async () => {
    try {
      await retry(connectToSDK, 5000, 3)
      breezSDKInitialized = true
      // console.log("BreezSDK initialized")
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
    console.log("Trying to receive payment with Breez SDK", sdk)
    const invoice = await sdk.receivePayment(paymentRequest)
    return invoice
  } catch (error) {
    console.log("Debugging the receive payment BREEZSDK", error)
    throw error
  }
}

export const sendPaymentBreezSDK = async (
  paymentRequest: string,
  amountMsat: number,
): Promise<sdk.SendPaymentResponse> => {
  try {
    const sendPaymentRequest: sdk.SendPaymentRequest = {
      bolt11: paymentRequest,
      amountMsat: amountMsat && toMilliSatoshi(amountMsat).toNumber(),
    }
    const response = await sdk.sendPayment(sendPaymentRequest)
    if (response.payment.status === sdk.PaymentStatus.FAILED) {
      console.log("Error paying Invoice: ", response.payment.details.data)
      console.log("Reporting issue to Breez SDK")
      const reportingResult = await sdk.reportIssue({
        type: sdk.ReportIssueRequestVariant.PAYMENT_FAILURE,
        data: {
          paymentHash: (response.payment.details.data as sdk.LnPaymentDetails)
            .paymentHash,
        },
      })
      console.log("Report issue result: ", reportingResult)
      throw new Error(response.payment.status)
    }
    return response
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const sendNoAmountPaymentBreezSDK = async (
  paymentRequest: string,
): Promise<sdk.SendPaymentResponse> => {
  console.log("Stepping into Sending payment with no amount function")
  try {
    console.log("Trying to send payment with no amount")
    const sendPaymentRequest: sdk.SendPaymentRequest = {
      bolt11: paymentRequest,
    }
    const response = await sdk.sendPayment(sendPaymentRequest)
    console.log("Payment status: ", response.payment.status)
    if (response.payment.status === sdk.PaymentStatus.FAILED) {
      console.log("Error paying Zero Amount Invoice: ", response.payment.details.data)
      console.log("Reporting issue to Breez SDK")
      const reportingResult = await sdk.reportIssue({
        type: sdk.ReportIssueRequestVariant.PAYMENT_FAILURE,
        data: {
          paymentHash: (response.payment.details.data as sdk.LnPaymentDetails)
            .paymentHash,
        },
      })
      console.log("Report issue result: ", reportingResult)
      throw new Error(response.payment.status)
    }
    if (response.payment.paymentType === null) {
      console.log("Payment type is null, replacing with LN payment")
      response.payment.paymentType = sdk.PaymentType.SENT
    }
    return response
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
    console.log("min amount: ", fees.min)
    console.log("max amount: ", fees.max)
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
): Promise<sdk.SendOnchainResponse> => {
  try {
    const sendOnChainRequest: sdk.SendOnchainRequest = {
      amountSat: currentFees.min,
      onchainRecipientAddress: destinationAddress,
      pairHash: currentFees.feesHash,
      satPerVbyte,
    }
    console.log("Sending onchain payment to address: ", destinationAddress)
    const response = await sdk.sendOnchain(sendOnChainRequest)
    if (response.reverseSwapInfo.status === sdk.ReverseSwapStatus.CANCELLED) {
      console.log("Error paying to OnChain Address")
      console.log("Reporting issue to Breez SDK")
      const reportingResult = await sdk.reportIssue({
        type: sdk.ReportIssueRequestVariant.PAYMENT_FAILURE,
        data: {
          paymentHash: response.reverseSwapInfo.id,
        },
      })
      console.log("Report issue result: ", reportingResult)
      throw new Error(response.reverseSwapInfo.status)
    }
    return response
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
  amountSat: number,
  memo: string,
): Promise<sdk.LnUrlPayResult> => {
  try {
    const input: sdk.InputType = await sdk.parseInput(lnurl)
    if (input.type === sdk.InputTypeVariant.LN_URL_PAY) {
      const req: sdk.LnUrlPayRequest = {
        data: input.data,
        amountMsat: amountSat * 1000,
        comment: memo,
      }
      const response = await sdk.payLnurl(req)
      if (response.type === sdk.LnUrlPayResultVariant.PAY_ERROR) {
        console.log("Error paying lnurl: ", response.data.reason)
        console.log("Reporting issue to Breez SDK")
        console.log("Payment hash: ", response.data.paymentHash)
        const paymentHash = response.data.paymentHash
        const reportingResult = await sdk.reportIssue({
          type: sdk.ReportIssueRequestVariant.PAYMENT_FAILURE,
          data: { paymentHash },
        })
        console.log("Report issue result: ", reportingResult)
        throw new Error(response.type)
      }
      return response
    }
    throw new Error("Unsupported input type")
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

export const listPaymentsBreezSDK = async (
  offset?: number,
  limit?: number,
): Promise<sdk.Payment[]> => {
  try {
    const payments = await sdk.listPayments({ offset, limit })
    return payments
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const addLogListenerBreezSDK = async (): Promise<void> => {
  try {
    const listener: sdk.LogStream = (log) => {
      console.log("Breez SDK Log: ", log)
    }
    await sdk.setLogStream(listener)
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

export const prepareRedeem = async (toAddress: string) => {
  try {
    const recommendedFees = await recommendedFeesBreezSDK()
    const satPerVbyte = recommendedFees.fastestFee
    console.log("satPerVbyte", satPerVbyte)
    const prepareRedeemOnchainFundsResp = await sdk.prepareRedeemOnchainFunds({
      toAddress,
      satPerVbyte,
    })
    console.log("PREPARE REDEEM>>>>>>>>>>>>:", prepareRedeemOnchainFundsResp)
    if (prepareRedeemOnchainFundsResp) {
      const redeemOnchainFundsResp = await sdk.redeemOnchainFunds({
        toAddress,
        satPerVbyte,
      })
      console.log("REDEEM>>>>>>>>>>>>>", redeemOnchainFundsResp)
    }
  } catch (err) {
    console.error("REDEEM ERROR", err)
  }
}
