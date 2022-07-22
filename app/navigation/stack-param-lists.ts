/* eslint-disable camelcase */
import { PaymentAmount, WalletCurrency } from "@app/types/amounts"
import { WalletDescriptor } from "@app/types/wallets"
import { LnUrlPayServiceResponse } from "lnurl-pay/dist/types/types"
import { GaloyGQL, PaymentType } from "@galoymoney/client"
import { contacts_me_contacts } from "../screens/contacts-screen/__generated__/contacts"
import { AccountType, AuthenticationScreenPurpose, PinScreenPurpose } from "../utils/enum"

export type TransactionDetail = GaloyGQL.Transaction & {
  usdAmount: number
  description: string
  isReceive: boolean
  isPending: boolean
}

export type RootStackParamList = {
  getStarted: undefined
  debug: undefined
  welcomeFirst: undefined
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
  setUsername: undefined
  sendBitcoinDestination: {
    payment?: string
    username?: string
  }
  sendBitcoinDetails: {
    fixedAmount: PaymentAmount<WalletCurrency.BTC> | undefined
    destination: string
    note?: string
    lnurl?: LnUrlPayServiceResponse
    recipientWalletId?: string
    paymentType: PaymentType
    sameNode: boolean
  }
  sendBitcoinConfirmation: {
    fixedAmount?: PaymentAmount<WalletCurrency.BTC>
    destination: string
    recipientWalletId?: string
    payerWalletDescriptor: WalletDescriptor<WalletCurrency>
    paymentAmountInBtc?: PaymentAmount<WalletCurrency.BTC>
    paymentAmountInUsd?: PaymentAmount<WalletCurrency.USD>
    note?: string
    paymentType: PaymentType
    sameNode: boolean
    lnurlInvoice?: string
  }
  transferConfirmation: {
    fromWallet: Wallet
    toWallet: Wallet
    satAmount: number
    satAmountInUsd: number
    dollarAmount: number
    amountCurrency: string
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
  TransferScreen: undefined
  receiveBitcoin: {
    receiveCurrency?: WalletCurrency
  }
  phoneValidation: undefined
  transactionDetail: TransactionDetail
  transactionHistory: undefined
  Earn: undefined
}

export type ContactStackParamList = {
  Contacts: undefined
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
