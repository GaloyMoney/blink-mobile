import find from "lodash.find"
import { ApolloClient, FetchPolicy, gql } from "@apollo/client"
import { MockableApolloClient } from "../types/mockable"
import { wallet_wallet } from "./__generated__/wallet"

export const QUERY_PRICE = gql`
  query prices($length: Int = 1) {
    prices(length: $length) {
      id
      o
    }
  }
`

export const WALLET = gql`
  query wallet {
    wallet {
      id
      balance
      currency
    }
  }
`

export const QUERY_EARN_LIST = gql`
  query earnList($logged: Boolean!) {
    earnList {
      id
      value
      completed @client(if: { not: $logged })
    }
  }
`

export const getWallet = (client: ApolloClient<unknown>): wallet_wallet[] => {
  const { wallet } = client.readQuery({
    query: WALLET,
  })
  return wallet
}

export const balanceBtc = (client: ApolloClient<unknown>): number => {
  const wallet = getWallet(client)
  if (!wallet) {
    return 0
  }
  return find(wallet, { id: "BTC" }).balance
}

export const queryWallet = async (
  client: ApolloClient<unknown>,
  fetchPolicy: FetchPolicy,
): Promise<void> => {
  await client.query({
    query: WALLET,
    fetchPolicy,
  })
}

export const getPubKey = (client: MockableApolloClient): string => {
  const { nodeStats } = client.readQuery({
    query: gql`
      query nodeStats {
        nodeStats {
          id
        }
      }
    `,
  })

  return nodeStats?.id ?? ""
}

export const getMyUsername = (client: MockableApolloClient): string => {
  const response = client.readQuery({
    query: gql`
      query username {
        me {
          username
        }
      }
    `,
  })

  return response?.me?.username ?? ""
}

export const USERNAME_EXIST = gql`
  query username_exist($username: String!) {
    usernameExists(username: $username)
  }
`

// eslint-disable-next-line @typescript-eslint/ban-types
export const walletIsActive = (client: ApolloClient<unknown>): boolean => {
  // { me } may not exist if the wallet is not active
  const result = client.readQuery({
    query: gql`
      query me {
        me {
          level
        }
      }
    `,
  })

  return result?.me?.level ?? 0 > 0
}

export const GET_LANGUAGE = gql`
  query language {
    me {
      id
      language
    }
  }
`

export const MAIN_QUERY = gql`
  query gql_main_query($logged: Boolean!) {
    wallet @include(if: $logged) {
      id
      balance
      currency
    }

    nodeStats {
      id
    }

    earnList {
      id
      value
      completed @include(if: $logged)
    }

    buildParameters {
      id
      minBuildNumberAndroid
      minBuildNumberIos
      lastBuildNumberAndroid
      lastBuildNumberIos
    }

    getLastOnChainAddress @include(if: $logged) {
      id
    }

    me @include(if: $logged) {
      id
      level
      username
      phone
      language
    }
  }
`

export const TRANSACTIONS_LIST = gql`
  query transactionsList($first: Int, $after: String) {
    me {
      id
      defaultAccount {
        wallets {
          id
          transactions(first: $first, after: $after) {
            edges {
              cursor
              node {
                __typename
                id
                settlementAmount
                settlementFee
                status
                direction
                settlementPrice {
                  base
                  offset
                }
                memo
                createdAt
                ... on LnTransaction {
                  paymentHash
                }
                ... on IntraLedgerTransaction {
                  otherPartyUsername
                }
              }
            }
          }
        }
      }
    }
  }
`

export const TRANSACTIONS_LIST_FOR_CONTACT = gql`
  query transactionsListForContact($username: Username!, $first: Int, $after: String) {
    me {
      id
      contactByUsername(username: $username) {
        transactions(first: $first, after: $after) {
          edges {
            cursor
            node {
              __typename
              id
              settlementAmount
              settlementFee
              status
              direction
              settlementPrice {
                base
                offset
              }
              memo
              createdAt
              ... on LnTransaction {
                paymentHash
              }
              ... on IntraLedgerTransaction {
                otherPartyUsername
              }
            }
          }
        }
      }
    }
  }
`

export const queryMain = async (
  client: ApolloClient<unknown>,
  variables: { logged: boolean },
): Promise<void> => {
  await client.query({
    query: MAIN_QUERY,
    variables,
    fetchPolicy: "network-only",
  })
}
