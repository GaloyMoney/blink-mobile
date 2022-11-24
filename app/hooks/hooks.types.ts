import { Price } from "@app/components/price-graph"
import { INetwork } from "@app/types/network"
import { GaloyGQL } from "@galoymoney/client"

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
  defaultWallet: GaloyGQL.Wallet
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
