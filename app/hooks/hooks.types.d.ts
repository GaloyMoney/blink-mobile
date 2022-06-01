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
  loading: boolean
  refetch: () => void
  errors: object[]
}
