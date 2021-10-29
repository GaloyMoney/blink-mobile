import { gql } from "@apollo/client"

export const INITWALLET = gql`
  query InitWallet {
    me {
      defaultAccount {
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
