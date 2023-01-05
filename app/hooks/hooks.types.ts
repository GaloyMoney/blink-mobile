import { Price } from "@app/components/price-graph"
import { INetwork } from "@app/types/network"
import { GaloyGQL } from "@galoymoney/client"

export type useMainQueryOutput = {
  accountId: string
  userPreferredLanguage: string
  btcWalletBalance: number
  btcWalletValueInUsd: number
  usdWalletBalance: number
  network: INetwork
  btcWalletId: string
  usdWalletId: string
  defaultWalletId: string
  mergedTransactions: GaloyGQL.Transaction[]
  wallets: GaloyGQL.Wallet[]
  defaultWallet: GaloyGQL.Wallet
  me: GaloyGQL.MeFragment
  myPubKey: string
  username?: string
  phoneNumber: string
  mobileVersions: GaloyGQL.MobileVersions
  initialBtcPrice: Price
  loading: boolean
  refetch: () => void
  errors: object[]
}
