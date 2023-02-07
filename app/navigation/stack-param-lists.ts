import { BtcPaymentAmount, PaymentAmount, UsdPaymentAmount } from "@app/types/amounts"
import { WalletDescriptor } from "@app/types/wallets"
import { AccountType, AuthenticationScreenPurpose, PinScreenPurpose } from "../utils/enum"
import { Transaction, WalletCurrency } from "@app/graphql/generated"
import { EarnSectionType } from "@app/screens/earns-screen/sections"
import { PaymentDetail } from "@app/screens/send-bitcoin-screen/payment-details/index.types"
import { ValidPaymentDestination } from "@app/screens/send-bitcoin-screen/send-bitcoin-reducer"

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
    validPaymentDestination: ValidPaymentDestination
  }
  sendBitcoinConfirmation: {
    paymentDetail: PaymentDetail<WalletCurrency>
    paymentDestination: ValidPaymentDestination
  }
  conversionDetails?: {
    transferAmount: PaymentAmount<WalletCurrency>
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
  redeemBitcoinDetail: {
    callback: string
    domain: string
    k1: string
    defaultDescription: string
    minWithdrawable: number
    maxWithdrawable: number
  }
  redeemBitcoinResult: {
    callback: string
    domain: string
    k1: string
    defaultDescription: string
    minWithdrawableSatoshis: number
    maxWithdrawableSatoshis: number
    receiveCurrency: WalletCurrency
    walletId: string
    satAmount: number
    satAmountInUsd: number
    amountCurrency: string
  }
  phoneValidation: undefined
  transactionDetail: TransactionDetail
  transactionHistory?: undefined
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
  Home: undefined
}

export type PrimaryStackParamList = {
  Home: undefined
  Contacts: undefined
  Map: undefined
  Earn: undefined
}
