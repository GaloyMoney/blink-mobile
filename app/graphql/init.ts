import { gql } from "@apollo/client"

export const INITWALLET = gql`
  query InitWallet {
    me {
      defaultAccount {
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
