import { Price } from "@app/components/price-graph"
import { MeFragment, Transaction, Network } from "@app/graphql/generated"

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
  mergedTransactions: Transaction[]
  wallets: Wallet[]
  defaultWallet: Wallet
  me: MeFragment
  myPubKey: string
  username?: string
  phoneNumber: string
  mobileVersions: mobileVersions
  initialBtcPrice: Price
  loading: boolean
  refetch: () => void
  errors: object[]
}
