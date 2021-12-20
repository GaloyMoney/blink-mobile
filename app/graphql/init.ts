import { gql } from "@apollo/client"

export const INITWALLET = gql`
  query InitWallet {
    me {
      id
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
    id: "guest",
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
