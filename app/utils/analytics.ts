/* eslint-disable camelcase */
import { GaloyInstanceName } from "@app/config/galoy-instances"
import { PaymentSendResult, WalletCurrency } from "@app/graphql/generated"
import { PaymentType as ParsedPaymentType } from "@galoymoney/client/dist/parsing-v2"
import analytics from "@react-native-firebase/analytics"

export const logRequestAuthCode = (instance: GaloyInstanceName) => {
  analytics().logEvent("request_auth_code", { instance })
}

export const logPaymentDestinationAccepted = (paymentType: ParsedPaymentType) => {
  analytics().logEvent("payment_destination_accepted", { paymentType })
}

type LogPaymentAttemptParams = {
  paymentType: ParsedPaymentType
  sendingWallet: WalletCurrency
}

export const logPaymentAttempt = (params: LogPaymentAttemptParams) => {
  analytics().logEvent("payment_attempt", {
    payment_type: params.paymentType,
    sending_wallet: params.sendingWallet,
  })
}

type LogPaymentResultParams = {
  paymentType: ParsedPaymentType
  sendingWallet: WalletCurrency
  paymentStatus: PaymentSendResult | null | undefined
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

export const logLogout = () => {
  analytics().logEvent("logout")
}

type LogToastShownParams = {
  message: string
  type: "error" | "success" | "warning"
  isTranslated: boolean
}

export const logToastShown = (params: LogToastShownParams) => {
  analytics().logEvent("toast_shown", {
    message: params.message,
    type: params.type,
    is_translated: params.isTranslated,
  })
}
