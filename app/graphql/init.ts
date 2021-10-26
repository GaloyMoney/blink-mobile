import { gql } from "@apollo/client"

export const INITWALLET = gql`
  query InitWallet {
    me {
      defaultAccount {
        wallets {
          id
          balance
          currency: walletCurrency
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
          currency: "BTC",
          balance: 0,
        },
      ],
    },
  },
}
