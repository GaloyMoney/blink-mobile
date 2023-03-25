import { MoneyAmount, WalletOrDisplayCurrency } from "@app/types/amounts"
import { AuthenticationScreenPurpose, PinScreenPurpose } from "../utils/enum"
import { WalletCurrency } from "@app/graphql/generated"
import { EarnSectionType } from "@app/screens/earns-screen/sections"
import { PaymentDetail } from "@app/screens/send-bitcoin-screen/payment-details/index.types"
import {
  PaymentDestination,
  ReceiveDestination,
} from "@app/screens/send-bitcoin-screen/payment-destination/index.types"
import { WalletDescriptor } from "@app/types/wallets"
import { PostAttributes } from "@app/modules/market-place/redux/reducers/store-reducer"

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
  earnsQuiz: { id: string }
  scanningQRCode: undefined
  settings: undefined
  addressScreen: undefined
  sendBitcoinDestination: {
    payment?: string
    username?: string
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
  Profile: undefined
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
    receiveCurrency: WalletCurrency
    receivingWalletDescriptor: WalletDescriptor<typeof WalletCurrency.Btc>
    unitOfAccountAmount: MoneyAmount<WalletOrDisplayCurrency>
    settlementAmount: MoneyAmount<typeof WalletCurrency.Btc>
    secondaryAmount: MoneyAmount<WalletOrDisplayCurrency> | undefined
  }
  phoneFlow: undefined
  transactionDetail: { txid: string }
  transactionHistory?: undefined
  Earn: undefined
  accountScreen: undefined
  transactionLimitsScreen: undefined,

  PostDetail: { editable?: boolean; postInfo: PostAttributes, postId?: string, title?: string, isMyPost?: boolean },
  StoreListView: { searchText: string }
  StoreList: undefined
  LocationPicker: undefined
}

export type ContactStackParamList = {
  contactList: undefined
  contactDetail: { contact: Contact }
  phoneFlow: undefined
  sendBitcoinDestination: { username: string }
  transactionDetail: { txid: string }
}

export type PhoneValidationStackParamList = {
  Primary: undefined
  phoneInput: undefined
  phoneValidation: { phone: string }
  authentication: {
    screenPurpose: AuthenticationScreenPurpose
  }
  Home: undefined
}

export type PrimaryStackParamList = {
  Home: undefined
  Contacts: undefined
  MarketPlaceStack: undefined
  Earn: undefined
}
