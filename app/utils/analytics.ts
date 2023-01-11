/* eslint-disable camelcase */
import { GaloyInstanceNames } from "@app/config/galoy-instances"
import { PaymentSendResult, WalletCurrency } from "@app/graphql/generated"
import { PaymentType } from "@galoymoney/client/dist/parsing-v2"
import analytics from "@react-native-firebase/analytics"

export const logRequestAuthCode = (instance: GaloyInstanceNames) => {
  analytics().logEvent("request_auth_code", { instance })
}

export const logPaymentDestinationAccepted = (paymentType: PaymentType) => {
  analytics().logEvent("payment_destination_accepted", { paymentType })
}

type LogPaymentAttemptParams = {
  paymentType: PaymentType
  sendingWallet: WalletCurrency
}

export const logPaymentAttempt = (params: LogPaymentAttemptParams) => {
  analytics().logEvent("payment_attempt", {
    payment_type: params.paymentType,
    sending_wallet: params.sendingWallet,
  })
}

type LogPaymentResultParams = {
  paymentType: PaymentType
  sendingWallet: WalletCurrency
  paymentStatus: PaymentSendResult
}

export const logPaymentResult = (params: LogPaymentResultParams) => {
  analytics().logEvent("payment_result", {
    payment_type: params.paymentType,
    sending_wallet: params.sendingWallet,
    payment_status: params.paymentStatus,
  })
}

type LogConversionAttemptParams = {
  sendingWallet: WalletCurrency
  receivingWallet: WalletCurrency
}

export const logConversionAttempt = (params: LogConversionAttemptParams) => {
  analytics().logEvent("conversion_attempt", {
    sending_wallet: params.sendingWallet,
    receiving_wallet: params.receivingWallet,
  })
}

type LogConversionResultParams = {
  sendingWallet: WalletCurrency
  receivingWallet: WalletCurrency
  paymentStatus: PaymentSendResult
}
export const logConversionResult = (params: LogConversionResultParams) => {
  analytics().logEvent("conversion_result", {
    sending_wallet: params.sendingWallet,
    receiving_wallet: params.receivingWallet,
    payment_status: params.paymentStatus,
  })
}

type LogGeneratePaymentRequestParams = {
  paymentType: "lightning" | "onchain"
  hasAmount: boolean
  receivingWallet: WalletCurrency
}

export const logGeneratePaymentRequest = (params: LogGeneratePaymentRequestParams) => {
  analytics().logEvent("generate_payment_request", {
    payment_type: params.paymentType,
    has_amount: params.hasAmount,
    receiving_wallet: params.receivingWallet,
  })
}

export const logEnterForeground = () => {
  analytics().logEvent("enter_foreground")
}

export const logEnterBackground = () => {
  analytics().logEvent("enter_background")
}
