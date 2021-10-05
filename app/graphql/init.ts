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

// FIXME TODO: add __typename for all values

export const initQuery = {
  wallet: [
    {
      __typename: "Wallet",
      id: "USD",
      currency: "USD",
      balance: 0,
    },
    {
      __typename: "Wallet",
      id: "BTC",
      currency: "BTC",
      balance: 0,
    },
  ],
}
