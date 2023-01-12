import { Price } from "@app/components/price-graph"
import { Network } from "@app/graphql/generated"

type mobileVersions = {
  currentSupported: number
  minSupported: number
  platform: string
}

export type useMainQueryOutput = {
  accountId: string
  userPreferredLanguage: string
  btcWalletBalance: number
  btcWalletValueInUsd: number
  usdWalletBalance: number
  network: Network
  btcWalletId: string
  usdWalletId: string
  defaultWalletId: string
  mergedTransactions: readonly object[]
  wallets: readonly any[]
  defaultWallet: Wallet
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
