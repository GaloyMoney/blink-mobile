import { InMemoryCache, gql } from "@apollo/client"
import { WalletCurrency } from "./generated"

export const createCache = () => {
  return new InMemoryCache({
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
            read: (_, { readField, cache }) => {
              const wallets = readField("wallets")
              if (Array.isArray(wallets)) {
                for (const w of wallets) {
                  try {
                    const wallet: Wallet = cache.readFragment({
                      id: w.__ref,
                      fragment: gql`
                        fragment MyWallet on UsdWallet {
                          id
                          walletCurrency
                          balance
                        }
                      `,
                    })
                    if (wallet.walletCurrency === WalletCurrency.Usd) {
                      return wallet
                    }
                  } catch (err) {
                    console.log("err usdWallet", err)
                  }
                }
              }
              return undefined
            },
          },
          btcWallet: {
            read: (_, { readField, cache }) => {
              const wallets = readField("wallets")
              if (Array.isArray(wallets)) {
                for (const w of wallets) {
                  try {
                    const wallet: Wallet = cache.readFragment({
                      id: w.__ref,
                      fragment: gql`
                        fragment MyWallet on BTCWallet {
                          id
                          walletCurrency
                          balance
                        }
                      `,
                    })
                    if (wallet.walletCurrency === WalletCurrency.Btc) {
                      return wallet
                    }
                  } catch (err) {
                    console.log("err btcWallet", err)
                  }
                }
              }
              return undefined
            },
          },
        },
      },
    },
  })
}
