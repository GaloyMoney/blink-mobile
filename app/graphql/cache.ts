import { InMemoryCache, gql } from "@apollo/client"
import {
  Account,
  MyWalletsFragmentDoc,
  RealtimePriceDocument,
  RealtimePriceQuery,
  Wallet,
  WalletCurrency,
} from "./generated"
import { relayStylePagination } from "@apollo/client/utilities"
import { ReadFieldFunction } from "@apollo/client/cache/core/types/common"

gql`
  fragment MyWallets on ConsumerAccount {
    wallets {
      id
      balance
      walletCurrency
    }
  }

  # only use for cache.
  # for the actual query, use the one under me.defaultAccount
  query realtimePrice {
    realtimePrice {
      btcSatPrice {
        base
        offset
        currencyUnit
      }
      denominatorCurrency
      id
      timestamp
      usdCentPrice {
        base
        offset
        currencyUnit
      }
    }
  }
`

type getWalletsInputs = {
  readField: ReadFieldFunction
  cache: InMemoryCache
}

const getWallets = ({
  readField,
  cache,
}: getWalletsInputs): readonly Wallet[] | undefined => {
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
      Account: ["ConsumerAccount"],
    },
    typePolicies: {
      Globals: {
        // singleton: only cache latest version:
        // https://www.apollographql.com/docs/react/caching/cache-configuration/#customizing-cache-ids
        keyFields: [],
      },
      RealtimePrice: {
        keyFields: [],
      },
      MapMarker: {
        keyFields: ["mapInfo", ["title", "coordinates"]],
      },
      Contact: {
        fields: {
          prettyName: {
            read(_, { readField }) {
              return readField("id") || readField("name")
            },
          },
        },
      },
      UserContact: {
        fields: {
          transactions: relayStylePagination(),
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
          beta: {
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

              // TODO: return toReference instead
              // https://www.apollographql.com/docs/react/caching/advanced-topics#cache-redirects
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

              // TODO: return toReference instead
              // https://www.apollographql.com/docs/react/caching/advanced-topics#cache-redirects
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

              // TODO: return toReference instead
              // https://www.apollographql.com/docs/react/caching/advanced-topics#cache-redirects
              return wallets.find((wallet) => wallet.id === defaultWalletId)
            },
          },
          transactions: relayStylePagination(),
        },
      },
      Wallet: {
        fields: {
          transactions: relayStylePagination(),
        },
      },
      BTCWallet: {
        fields: {
          displayBalance: {
            read: (_, { readField, cache }) => {
              const res = cache.readQuery<RealtimePriceQuery>({
                query: RealtimePriceDocument,
              })
              if (!res?.realtimePrice?.btcSatPrice.base) {
                return NaN
              }
              if (!res?.realtimePrice?.btcSatPrice.offset) {
                return NaN
              }

              // TODO: use function from usePriceConversion
              const base = res.realtimePrice.btcSatPrice.base
              const offset = res.realtimePrice.btcSatPrice.offset
              const btcPrice = base / 10 ** offset
              const satsAmount = Number(readField("balance"))

              return (satsAmount * btcPrice) / 100
            },
          },
        },
      },
      UsdWallet: {
        fields: {
          displayBalance: {
            read: (_, { readField, cache }) => {
              const res = cache.readQuery<RealtimePriceQuery>({
                query: RealtimePriceDocument,
              })
              if (!res?.realtimePrice?.usdCentPrice.base) {
                return NaN
              }
              if (!res?.realtimePrice?.usdCentPrice.offset) {
                return NaN
              }

              // TODO: use function from usePriceConversion
              const base = res.realtimePrice.usdCentPrice.base
              const offset = res.realtimePrice.usdCentPrice.offset
              const usdPrice = base / 10 ** offset
              const centsAmount = Number(readField("balance"))

              return (centsAmount * usdPrice) / 100
            },
          },
        },
      },
    },
  })
