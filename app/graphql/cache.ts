import { InMemoryCache, gql } from "@apollo/client"
import {
  Account,
  CurrentPriceDocument,
  CurrentPriceQuery,
  MyWalletsFragmentDoc,
  Wallet,
  WalletCurrency,
} from "./generated"

gql`
  fragment MyWallets on ConsumerAccount {
    wallets {
      id
      balance
      walletCurrency
    }
  }

  query currentPrice {
    btcPrice {
      formattedAmount
    }
  }
`

const getWallets = ({ readField, cache }): readonly Wallet[] | undefined => {
  const id = readField("id")
  const key = `ConsumerAccount:${id}`
  const account: Account | null = cache.readFragment({
    id: key,
    fragment: MyWalletsFragmentDoc,
  })
  if (account === null) {
    return undefined
  }
  return account.wallets
}

export const createCache = () =>
  new InMemoryCache({
    possibleTypes: {
      // TODO: add other possible types
      Wallet: ["BTCWallet", "UsdWallet"],
    },
    typePolicies: {
      Contact: {
        fields: {
          prettyName: {
            read(_, { readField }) {
              return readField("id") || readField("name")
            },
          },
        },
      },
      Earn: {
        fields: {
          completed: {
            read: (value) => value ?? false,
          },
        },
      },
      Query: {
        fields: {
          // local only fields
          hideBalance: {
            read: (value) => value ?? false,
          },
          hiddenBalanceToolTip: {
            read: (value) => value ?? false,
          },
        },
      },
      ConsumerAccount: {
        fields: {
          usdWallet: {
            read: (_, { readField, cache }): Wallet | undefined => {
              const wallets = getWallets({ readField, cache })
              if (wallets === undefined || wallets.length === 0) {
                return undefined
              }

              return wallets.find(
                (wallet) => wallet.walletCurrency === WalletCurrency.Usd,
              )
            },
          },
          btcWallet: {
            read: (_, { readField, cache }) => {
              const wallets = getWallets({ readField, cache })
              if (wallets === undefined || wallets.length === 0) {
                return undefined
              }

              return wallets.find(
                (wallet) => wallet.walletCurrency === WalletCurrency.Btc,
              )
            },
          },
          defaultWallet: {
            read: (_, { readField, cache }): Wallet | undefined => {
              const wallets = getWallets({ readField, cache })
              if (wallets === undefined || wallets.length === 0) {
                return undefined
              }

              const defaultWalletId = readField("defaultWalletId")
              return wallets.find((wallet) => wallet.id === defaultWalletId)
            },
          },
        },
      },
      BTCWallet: {
        fields: {
          usdBalance: {
            read: (_, { readField, cache }) => {
              const res = cache.readQuery<CurrentPriceQuery>({
                query: CurrentPriceDocument,
              })
              if (!res?.btcPrice?.formattedAmount) {
                return undefined
              }

              // TODO: use function from usePriceConversion
              // TODO: verify type
              const btcPrice = Number(res.btcPrice.formattedAmount)
              const satsAmount = Number(readField("balance"))

              return (satsAmount * btcPrice) / 100
            },
          },
        },
      },
    },
  })
