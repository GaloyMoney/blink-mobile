import { DisplayCurrency, MoneyAmount, WalletOrDisplayCurrency } from "@app/types/amounts"
import { AuthenticationScreenPurpose, PinScreenPurpose } from "../utils/enum"
import { PhoneCodeChannelType, WalletCurrency } from "@app/graphql/generated"
import { EarnSectionType } from "@app/screens/earns-screen/sections"
import { PaymentDetail } from "@app/screens/send-bitcoin-screen/payment-details/index.types"
import {
  PaymentDestination,
  ReceiveDestination,
} from "@app/screens/send-bitcoin-screen/payment-destination/index.types"
import { WalletDescriptor } from "@app/types/wallets"
import { PhoneLoginInitiateType } from "@app/screens/phone-auth-screen"
import { NavigatorScreenParams } from "@react-navigation/native"

export type RootStackParamList = {
  getStarted: undefined
  liteDeviceAccount: {
    appCheckToken: string
  }
  developerScreen: undefined
  authenticationCheck: undefined
  authentication: {
    screenPurpose: AuthenticationScreenPurpose
    isPinEnabled: boolean
  }
  pin: { screenPurpose: PinScreenPurpose }
  Primary: undefined
  earnsSection: { section: EarnSectionType }
  earnsQuiz: { id: string }
  scanningQRCode: undefined
  settings: undefined
  addressScreen: undefined
  defaultWallet: undefined
  theme: undefined
  sendBitcoinDestination: {
    payment?: string
    username?: string
    autoValidate?: boolean
  }
  sendBitcoinDetails: {
    paymentDestination: PaymentDestination
  }
  sendBitcoinConfirmation: {
    paymentDetail: PaymentDetail<WalletCurrency>
  }
  conversionDetails: undefined
  conversionConfirmation: {
    fromWalletCurrency: WalletCurrency
    moneyAmount: MoneyAmount<WalletOrDisplayCurrency>
  }
  conversionSuccess: undefined
  sendBitcoinSuccess: undefined
  language: undefined
  currency: undefined
  security: {
    mIsBiometricsEnabled: boolean
    mIsPinEnabled: boolean
  }
  lnurl: { username: string }
  sectionCompleted: { amount: number; sectionTitle: string }
  priceHistory: undefined
  receiveBitcoin: undefined
  redeemBitcoinDetail: {
    receiveDestination: ReceiveDestination
  }
  redeemBitcoinResult: {
    callback: string
    domain: string
    k1: string
    defaultDescription: string
    minWithdrawableSatoshis: MoneyAmount<typeof WalletCurrency.Btc>
    maxWithdrawableSatoshis: MoneyAmount<typeof WalletCurrency.Btc>
    receivingWalletDescriptor: WalletDescriptor<typeof WalletCurrency.Btc>
    unitOfAccountAmount: MoneyAmount<WalletOrDisplayCurrency>
    settlementAmount: MoneyAmount<typeof WalletCurrency.Btc>
    displayAmount: MoneyAmount<DisplayCurrency>
  }
  phoneFlow?: NavigatorScreenParams<PhoneValidationStackParamList>
  phoneRegistrationInitiate: undefined
  phoneRegistrationValidate: { phone: string; channel: PhoneCodeChannelType }
  transactionDetail: { txid: string }
  transactionHistory?: undefined
  Earn: undefined
  accountScreen: undefined
  notificationSettingsScreen: undefined
  transactionLimitsScreen: undefined
  emailRegistrationInitiate: undefined
  emailRegistrationValidate: { email: string; emailRegistrationId: string }
  emailLoginInitiate: undefined
  emailLoginValidate: { email: string; emailLoginId: string }
  totpRegistrationInitiate: undefined
  totpRegistrationValidate: { totpRegistrationId: string }
  totpLoginValidate: { authToken: string }
  webView: { url: string; initialTitle?: string }
}

export type PeopleStackParamList = {
  peopleHome: undefined
  contactDetail: { contact: Contact }
  circlesDashboard: undefined
  allContacts: undefined
}

export type PhoneValidationStackParamList = {
  Primary: undefined
  phoneLoginInitiate: {
    type?: PhoneLoginInitiateType
  }
  phoneLoginValidate: { phone: string; channel: PhoneCodeChannelType }
  authentication: {
    screenPurpose: AuthenticationScreenPurpose
  }
  Home: undefined
  totpLoginValidate: { authToken: string }
}

export type PrimaryStackParamList = {
  Home: undefined
  People: undefined
  Map: undefined
  Earn: undefined
  Web: undefined
}
