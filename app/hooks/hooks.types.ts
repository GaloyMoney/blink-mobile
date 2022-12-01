import { Price } from "@app/components/price-graph"
import { INetwork } from "@app/types/network"

type mobileVersions = {
  currentSupported: string
  minSupported: string
  platform: string
}

export type useMainQueryOutput = {
  userPreferredLanguage: string
  btcWalletBalance: number
  btcWalletValueInUsd: number
  usdWalletBalance: number
  network: INetwork
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
