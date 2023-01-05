import { Price } from "@app/components/price-graph"
import { WalletCurrency } from "@app/types/amounts"
import { INetwork } from "@app/types/network"
import { GaloyGQL } from "@galoymoney/client"

type mobileVersions = {
  currentSupported: string
  minSupported: string
  platform: string
}

type Wallet = {
  readonly __typename: "BTCWallet" | "USDTWallet"
  readonly id: string
  readonly balance: number
  readonly walletCurrency: WalletCurrency
}

type UserTransactions = {
  readonly __typename: "TransactionConnection"
  edges: [
    {
      readonly __typename: "TransactionEdge"
      readonly node: object[]
    },
  ]
  pageInfo: {
    hasNextPage: boolean
    hasPreviousPage: boolean
    startCursor: string
    endCursor: string
  }
}

type User = {
  readonly __typename: "User"
  defaultAccount: {
    readonly __typename: "ConsumerAccount"
    readonly defaultWalletId: string
    readonly id: string
    readonly transactions: UserTransactions
    readonly wallets: Wallet[]
  }
  readonly id: string
  readonly language: string
  readonly phone: string
  readonly quizQuestions: object[]
  readonly username: string
}

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
  mergedTransactions: UserTransactions[]
  wallets: Wallet[]
  defaultWallet: GaloyGQL.Wallet
  me: User
  myPubKey: string
  username?: string
  phoneNumber: string
  mobileVersions: mobileVersions
  initialBtcPrice: Price
  loading: boolean
  refetch: () => void
  errors: object[]
}
