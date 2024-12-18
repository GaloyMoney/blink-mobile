import * as bip39 from "bip39"
import * as Keychain from "react-native-keychain"
import RNFS from "react-native-fs"
import { PaymentType } from "@galoymoney/client"
import {
  connect,
  defaultConfig,
  fetchLightningLimits,
  fetchOnchainLimits,
  LiquidNetwork,
  listPayments,
  Payment,
  prepareReceivePayment,
  prepareSendPayment,
  receivePayment,
  sendPayment,
  SendPaymentResponse,
  disconnect,
  parseInvoice,
  LnInvoice,
  preparePayOnchain,
  LnUrlPayResult,
  parse,
  InputTypeVariant,
  lnurlPay,
  LnUrlPayResultVariant,
  payOnchain,
  lnurlWithdraw,
  LnUrlWithdrawResultVariant,
  PaymentMethod,
  ReceivePaymentResponse,
} from "@breeztech/react-native-breez-sdk-liquid"

export const KEYCHAIN_MNEMONIC_KEY = "mnemonic_key"

export let breezSDKInitialized = false
let breezSDKInitializing: Promise<void | boolean> | null = null

export const initializeBreezSDK = async (): Promise<boolean> => {
  if (breezSDKInitialized) {
    return false
  }

  if (breezSDKInitializing !== null) {
    return breezSDKInitializing as Promise<boolean>
  }

  breezSDKInitializing = (async () => {
    try {
      await retry(connectToSDK, 5000, 1)
      breezSDKInitialized = true
      return true
    } catch (error: any) {
      console.error("Failed to connect to Breez SDK after 3 attempts: ", error.message)
      throw new Error(`Failed to connect to Breez SDK after 3 attempts: ${error.message}`)
    } finally {
      breezSDKInitializing = null
    }
  })()

  return breezSDKInitializing as Promise<boolean>
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
        if (++attempts >= maxRetries) {
          reject(err)
        } else {
          setTimeout(tryFn, ms)
        }
      }
    }
    tryFn()
  })

const connectToSDK = async () => {
  try {
    const mnemonic = await getMnemonic()
    const config = await defaultConfig(LiquidNetwork.MAINNET)

    await connect({ mnemonic, config })
  } catch (error) {
    console.error("Connect to Breez SDK - Liquid error: ", error)
    throw error
  }
}

export const disconnectToSDK = async () => {
  try {
    if (breezSDKInitialized) {
      const config = await defaultConfig(LiquidNetwork.MAINNET)
      await disconnect()
      await RNFS.unlink(config.workingDir)
      breezSDKInitialized = false
      breezSDKInitializing = null
    }
  } catch (error) {
    console.error("Disconnect error: ", error)
    throw error
  }
}

const getMnemonic = async (): Promise<string> => {
  try {
    console.log("Looking for mnemonic in keychain")
    const credentials = await Keychain.getInternetCredentials(KEYCHAIN_MNEMONIC_KEY)
    if (credentials) {
      console.log("Mnemonic found in keychain")
      return credentials.password
    }

    console.log("Mnemonic not found in keychain. Generating new one")
    const mnemonic = bip39.generateMnemonic(128)
    await Keychain.setInternetCredentials(
      KEYCHAIN_MNEMONIC_KEY,
      KEYCHAIN_MNEMONIC_KEY,
      mnemonic,
    )
    return mnemonic
  } catch (error) {
    console.error("Error in getMnemonic: ", error)
    throw error
  }
}

export const fetchBreezLightningLimits = async () => {
  const lightningLimits = await fetchLightningLimits()
  console.log(`LIGHTNING LIMITS:`, lightningLimits)
  return lightningLimits
}

export const fetchBreezOnChainLimits = async () => {
  const onChainLimits = await fetchOnchainLimits()
  console.log(`ONCHAIN LIMITS: ${onChainLimits}`)
  return onChainLimits
}

export const fetchBreezFee = async (
  paymentType: PaymentType,
  invoice?: string,
  receiverAmountSat?: number,
) => {
  try {
    if (paymentType === "lightning" && !!invoice) {
      const response = await prepareSendPayment({
        destination: invoice,
        amountSat: receiverAmountSat,
      })
      return { fee: response.feesSat, err: null }
    } else if (paymentType === "onchain" && !!receiverAmountSat) {
      const response = await preparePayOnchain({
        receiverAmountSat,
      })
      return { fee: response.totalFeesSat, err: null }
    } else if ((paymentType === "intraledger" || paymentType === "lnurl") && !!invoice) {
      // const response = await parse(invoice)
      // console.log(">>>>>>>>>>>.", response)

      return { fee: null, err: "Failed to get fee" }
    } else {
      return { fee: null, err: "Wrong payment type" }
    }
  } catch (err) {
    return { fee: null, err: err }
  }
}

export const receivePaymentBreezSDK = async (
  payerAmountSat?: number,
  description?: string,
): Promise<LnInvoice> => {
  try {
    const currentLimits = await fetchLightningLimits()
    console.log(`Minimum amount, in sats: ${currentLimits.receive.minSat}`)
    console.log(`Maximum amount, in sats: ${currentLimits.receive.maxSat}`)

    // Set the amount you wish the payer to send, which should be within the above limits
    const prepareResponse = await prepareReceivePayment({
      payerAmountSat: payerAmountSat || currentLimits.receive.minSat,
      paymentMethod: PaymentMethod.LIGHTNING,
    })
    // If the fees are acceptable, continue to create the Receive Payment
    const receiveFeesSat = prepareResponse.feesSat
    console.log("Receive fee in sats: ", receiveFeesSat)

    const res = await receivePayment({
      prepareResponse,
      description,
    })

    const parsed = await parseInvoice(res.destination)

    return parsed
  } catch (error) {
    console.log("Debugging the receive payment BREEZSDK", error)
    throw error
  }
}

export const receiveOnchainBreezSDK = async (
  amount?: number,
): Promise<ReceivePaymentResponse> => {
  try {
    // Fetch the Onchain Receive limits
    const currentLimits = await fetchOnchainLimits()
    console.log(`Minimum amount, in sats: ${currentLimits.receive.minSat}`)
    console.log(`Maximum amount, in sats: ${currentLimits.receive.maxSat}`)

    // Set the amount you wish the payer to send, which should be within the above limits
    const prepareResponse = await prepareReceivePayment({
      payerAmountSat: amount || currentLimits.receive.minSat,
      paymentMethod: PaymentMethod.BITCOIN_ADDRESS,
    })

    // If the fees are acceptable, continue to create the Onchain Receive Payment
    const receiveFeesSat = prepareResponse.feesSat
    console.log("Receive fee in sats", receiveFeesSat)

    const receiveOnchainResponse = await receivePayment({ prepareResponse })

    return receiveOnchainResponse
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const sendPaymentBreezSDK = async (
  bolt11: string,
): Promise<SendPaymentResponse> => {
  try {
    const prepareResponse = await prepareSendPayment({
      destination: bolt11,
    })

    // If the fees are acceptable, continue to create the Send Payment
    const receiveFeesSat = prepareResponse.feesSat
    console.log("Receive fee in sats", receiveFeesSat)

    const sendResponse = await sendPayment({ prepareResponse })

    if (sendResponse.payment.status === "failed") {
      console.log("Error paying Invoice: ", sendResponse)
      throw new Error(sendResponse.payment.status)
    }
    return sendResponse
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const sendOnchainBreezSDK = async (
  destinationAddress: string,
  amountSat: number,
): Promise<SendPaymentResponse> => {
  try {
    const prepareResponse = await preparePayOnchain({
      receiverAmountSat: amountSat,
    })

    // Check if the fees are acceptable before proceeding
    const totalFeesSat = prepareResponse.totalFeesSat

    const payOnchainRes = await payOnchain({
      address: destinationAddress,
      prepareResponse,
    })

    return payOnchainRes
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const payLnurlBreezSDK = async (
  lnurl: string,
  amountSat: number,
  memo: string,
): Promise<LnUrlPayResult> => {
  try {
    const input = await parse(lnurl)
    if (input.type === InputTypeVariant.LN_URL_PAY) {
      const lnUrlPayResult = await lnurlPay({
        data: input.data,
        amountMsat: amountSat * 1000,
        validateSuccessActionUrl: true,
      })

      if (lnUrlPayResult.type === LnUrlPayResultVariant.PAY_ERROR) {
        console.log("Error paying lnurl: ", lnUrlPayResult.data.reason)
        console.log("Reporting issue to Breez SDK")
        console.log("Payment hash: ", lnUrlPayResult.data.paymentHash)
        throw new Error(lnUrlPayResult.data.reason)
      }
      return lnUrlPayResult
    }
    throw new Error("Unsupported input type")
  } catch (error) {
    throw error
  }
}

export const onRedeem = async (lnurl: string, defaultDescription: string) => {
  try {
    const input = await parse(lnurl)

    if (input.type === InputTypeVariant.LN_URL_PAY) {
      const lnUrlPayResult = await lnurlPay({
        data: input.data,
        amountMsat: input.data.minSendable,
        validateSuccessActionUrl: true,
      })
      console.log("LNURL PAY>>>>>>>>", lnUrlPayResult)
      if (lnUrlPayResult.type === LnUrlPayResultVariant.ENDPOINT_SUCCESS) {
        return { success: true, error: undefined }
      } else {
        return { success: false, error: lnUrlPayResult?.data?.reason }
      }
    } else if (input.type === InputTypeVariant.LN_URL_WITHDRAW) {
      const lnUrlWithdrawResult = await lnurlWithdraw({
        data: input.data,
        amountMsat: input.data.minWithdrawable,
        description: defaultDescription,
      })
      console.log("LNURL WITHDRAW>>>>>>>>", lnUrlWithdrawResult)
      if (lnUrlWithdrawResult.type === LnUrlWithdrawResultVariant.OK) {
        return { success: true, error: undefined }
      } else if (lnUrlWithdrawResult.type === LnUrlWithdrawResultVariant.ERROR_STATUS) {
        return { success: false, error: lnUrlWithdrawResult?.data?.reason }
      } else {
        return { success: false, error: undefined }
      }
    } else if (input.type === InputTypeVariant.LN_URL_ERROR) {
      return { success: false, error: input?.data?.reason }
    } else {
      return { success: false, error: "Invalid invoice" }
    }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export const parseInvoiceBreezSDK = async (
  paymentRequest: string,
): Promise<LnInvoice> => {
  try {
    const invoice = await parseInvoice(paymentRequest)
    return invoice
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const listPaymentsBreezSDK = async (
  offset?: number,
  limit?: number,
): Promise<Payment[]> => {
  try {
    const payments = await listPayments({ offset, limit })
    return payments
  } catch (error) {
    console.log(error)
    throw error
  }
}
