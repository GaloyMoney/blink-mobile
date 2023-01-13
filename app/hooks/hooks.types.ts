import { Price } from "@app/components/price-graph"
import { Network } from "@app/graphql/generated"

type mobileVersions = {
  currentSupported: number
  minSupported: number
  platform: string
}

export type useMainQueryOutput = {
  accountId: string | undefined
  userPreferredLanguage: string | undefined
  btcWalletBalance: number
  btcWalletValueInUsd: number
  usdWalletBalance: number
  network: Network | undefined
  btcWalletId: string | undefined
  usdWalletId: string | undefined
  defaultWalletId: string | undefined
  mergedTransactions: readonly object[] | undefined | null
  wallets: readonly any[] | undefined
  defaultWallet: Wallet | undefined
  me: any
  myPubKey: string
  username?: string | null
  phoneNumber: string | null | undefined
  mobileVersions: mobileVersions | null | undefined
  initialBtcPrice: Price | undefined | null
  loading: boolean
  refetch: () => void
  errors: object[]
}
