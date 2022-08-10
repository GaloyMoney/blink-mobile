/* eslint-disable @typescript-eslint/no-explicit-any */

type SetConvertedAmountsInput = {
  moneyAmount: MoneyAmount
}

type mobileVersions = {
  currentSupported: string
  minSupported: string
  platform: string
}

type useMainQueryOutput = {
  userPreferredLanguage: string
  btcWalletBalance: number
  btcWalletValueInUsd: number
  usdWalletBalance: number
  btcWalletId: string
  usdWalletId: string
  defaultWalletId: string
  mergedTransactions: object[]
  wallets: any[]
  defaultWallet: any
  me: any
  myPubKey: string
  username?: string
  phoneNumber: string
  mobileVersions: mobileVersions
  initialBtcPrice: Price
  loading: boolean
  refetch: () => void
  errors: object[]
}
