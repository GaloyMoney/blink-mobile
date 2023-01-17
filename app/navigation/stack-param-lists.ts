import { BtcPaymentAmount, PaymentAmount, UsdPaymentAmount } from "@app/types/amounts"
import { WalletDescriptor } from "@app/types/wallets"
import { LnUrlPayServiceResponse } from "lnurl-pay/dist/types/types"
import { PaymentType } from "@galoymoney/client/dist/parsing-v2"
import { AccountType, AuthenticationScreenPurpose, PinScreenPurpose } from "../utils/enum"
import { Transaction, WalletCurrency } from "@app/graphql/generated"
import { EarnSectionType } from "@app/screens/earns-screen/sections"

export type TransactionDetail = Transaction & {
  usdAmount: number
  description: string
  isReceive: boolean
  isPending: boolean
}

export type RootStackParamList = {
  getStarted: undefined
  debug: undefined
  authenticationCheck: undefined
  authentication: {
    screenPurpose: AuthenticationScreenPurpose
    isPinEnabled: boolean
  }
  pin: { screenPurpose: PinScreenPurpose }
  Primary: undefined
  earnsSection: { section: EarnSectionType }
  earnsQuiz: {
    title: string
    text: string
    amount: number
    question: string
    answers: string[]
    feedback: string[]
    onComplete: () => Promise<void>
    id: string
    completed: boolean
  }
  scanningQRCode: undefined
  settings: undefined
  addressScreen: undefined
  sendBitcoinDestination: {
    payment?: string
    username?: string
  }
  sendBitcoinDetails: {
    fixedAmount?: BtcPaymentAmount
    destination: string
    note?: string
    lnurl?: LnUrlPayServiceResponse
    recipientWalletId?: string
    paymentType: PaymentType
  }
  sendBitcoinConfirmation: {
    fixedAmount?: BtcPaymentAmount
    destination: string
    recipientWalletId?: string
    payerWalletDescriptor: WalletDescriptor<WalletCurrency>
    paymentAmountInBtc?: BtcPaymentAmount
    paymentAmountInUsd?: UsdPaymentAmount
    note?: string
    paymentType: PaymentType
    lnurlInvoice?: string
  }
  conversionDetails: {
    transferAmount: PaymentAmount<WalletCurrency> | undefined
  }
  conversionConfirmation: {
    fromWalletCurrency: WalletCurrency
    btcAmount: BtcPaymentAmount
    usdAmount: UsdPaymentAmount
    usdPerBtc: UsdPaymentAmount
  }
  conversionSuccess: {
    fromWallet: WalletDescriptor<WalletCurrency>
    toWallet: WalletDescriptor<WalletCurrency>
    btcAmount: BtcPaymentAmount
    usdAmount: UsdPaymentAmount
  }
  sendBitcoinSuccess: undefined
  language: undefined
  security: {
    mIsBiometricsEnabled: boolean
    mIsPinEnabled: boolean
  }
  lnurl: { username: string }
  sectionCompleted: { amount: number; sectionTitle: string }
  priceDetail: {
    account: AccountType
  }
  Profile: undefined
  receiveBitcoin: {
    receiveCurrency?: WalletCurrency
  }
  phoneValidation: undefined
  transactionDetail: TransactionDetail
  transactionHistory: undefined
  Earn: undefined
  accountScreen: undefined
  transactionLimitsScreen: undefined
}

export type ContactStackParamList = {
  contactList: undefined
  contactDetail: { contact: Contact }
  phoneValidation: undefined
  sendBitcoinDestination: { username: string }
  transactionDetail: TransactionDetail
}

export type PhoneValidationStackParamList = {
  Primary: undefined
  welcomePhoneInput: undefined
  welcomePhoneValidation: {
    phone: string
    setPhone: (str: string) => void
  }
  authentication: {
    screenPurpose: AuthenticationScreenPurpose
  }
  moveMoney: undefined
}

export type PrimaryStackParamList = {
  MoveMoney: undefined
  Contacts: undefined
  Map: undefined
  Earn: undefined
  sendBitcoinDestination: { username: string }
  phoneValidation: undefined
}
