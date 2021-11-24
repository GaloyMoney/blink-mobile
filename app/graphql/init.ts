import { gql } from "@apollo/client"

export const INITWALLET = gql`
  query InitWallet {
    me {
      defaultAccount {
        id
        defaultWalletId
        wallets {
          id
          balance
          walletCurrency
        }
      }
    }
  }
`

export const initQuery = {
  me: {
    defaultAccount: {
      id: "BTC",
      defaultWalletId: "BTC",
      wallets: [
        {
          __typename: "Wallet",
          id: "BTC",
          walletCurrency: "BTC",
          balance: 0,
        },
      ],
    },
  },
}
