import { gql } from "@apollo/client"

export const INITWALLET = gql`
  query InitWallet {
    wallet {
      id
      balance
      currency
    }
  }
`

export const initQuery = {
  wallet: [
    {
      __typename: "Wallet",
      id: "BTC",
      currency: "BTC",
      balance: 0,
    },
  ],
}
