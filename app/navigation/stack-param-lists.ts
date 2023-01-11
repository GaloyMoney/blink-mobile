/* eslint-disable camelcase */
import { PaymentAmount } from "@app/types/amounts"
import { WalletDescriptor } from "@app/types/wallets"
import { LnUrlPayServiceResponse } from "lnurl-pay/dist/types/types"
import { PaymentType } from "@galoymoney/client/dist/parsing-v2"
import { contacts_me_contacts } from "../screens/contacts-screen/__generated__/contacts"
import { AccountType, AuthenticationScreenPurpose, PinScreenPurpose } from "../utils/enum"
import { Transaction, WalletCurrency } from "@app/graphql/generated"

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
  earnsSection: { section: number }
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
    fixedAmount?: PaymentAmount<WalletCurrency> // was "BTC" before but typescript complained?
    destination: string
    note?: string
    lnurl?: LnUrlPayServiceResponse
    recipientWalletId?: string
    paymentType: PaymentType
    sameNode: boolean
  }
  sendBitcoinConfirmation: {
    fixedAmount?: PaymentAmount<WalletCurrency> // was "BTC" before but typescript complained?
    destination: string
    recipientWalletId?: string
    payerWalletDescriptor: WalletDescriptor<WalletCurrency>
    paymentAmountInBtc?: PaymentAmount<"BTC">
    paymentAmountInUsd?: PaymentAmount<"USD">
    note?: string
    paymentType: PaymentType
    sameNode: boolean
    lnurlInvoice?: string
  }
  conversionDetails: {
    transferAmount: PaymentAmount<WalletCurrency> | undefined
  }
  conversionConfirmation: {
    fromWallet: WalletDescriptor<WalletCurrency>
    toWallet: WalletDescriptor<WalletCurrency>
    btcAmount: PaymentAmount<"BTC">
    usdAmount: PaymentAmount<"USD">
    usdPerBtc: PaymentAmount<"USD">
  }
  conversionSuccess: {
    fromWallet: WalletDescriptor<WalletCurrency>
    toWallet: WalletDescriptor<WalletCurrency>
    btcAmount: PaymentAmount<"BTC">
    usdAmount: PaymentAmount<"USD">
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
  contactDetail: { contact: contacts_me_contacts }
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
  earnsSection: { section: string }
}
