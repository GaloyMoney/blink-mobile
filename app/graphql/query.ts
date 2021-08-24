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
      transactions {
        id
        amount
        description
        created_at
        hash
        type
        usd
        fee
        feeUsd
        pending
        username
        date @client
        date_format @client
        date_nice_print @client
        isReceive @client
        text @client
      }
    }
  }
`

export const QUERY_TRANSACTIONS = gql`
  query query_transactions {
    wallet {
      id
      transactions {
        id
        amount
        description
        created_at
        hash
        type
        usd
        fee
        feeUsd
        pending
        username
        date @client
        date_format @client
        date_nice_print @client
        isReceive @client
        text @client
      }
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

export const balanceBtc = (client: ApolloClient<unknown>): number =>
  find(getWallet(client), { id: "BTC" }).balance

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
  const { me } = client.readQuery({
    query: gql`
      query username {
        me {
          username
        }
      }
    `,
  })

  return me?.username ?? ""
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
    prices(length: 1) {
      id
      o
    }

    maps {
      id
      title
      username
      coordinate {
        latitude
        longitude
      }
    }

    nodeStats {
      id
    }

    earnList {
      id
      value
      completed @include(if: $logged)
    }

    wallet @include(if: $logged) {
      id
      balance
      currency
      transactions {
        id
        amount
        description
        created_at
        hash
        type
        usd
        fee
        feeUsd
        pending
        username
        date @client
        date_format @client
        date_nice_print @client
        isReceive @client
        text @client
      }
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
      contacts {
        id
        name
        transactionsCount
      }
    }
  }
`

export const queryMain = async (
  client: ApolloClient<unknown>,
  variables: { logged: boolean },
): Promise<void> => {
  await client.query({
    query: WALLET,
    variables,
    fetchPolicy: "network-only",
  })
}
