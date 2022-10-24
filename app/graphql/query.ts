import { gql } from "@apollo/client"
import { MockableApolloClient } from "../types/mockable"

export const USERNAME_AVAILABLE = gql`
  query usernameAvailable($username: Username!) {
    usernameAvailable(username: $username)
  }
`

const TRANSACTION_LIST_FRAGMENT = gql`
  fragment TransactionList on TransactionConnection {
    pageInfo {
      hasNextPage
    }
    edges {
      cursor
      node {
        __typename
        id
        status
        direction
        memo
        createdAt

        settlementCurrency
        settlementAmount
        settlementFee
        settlementPrice {
          base
          offset
        }

        initiationVia {
          __typename
          ... on InitiationViaIntraLedger {
            counterPartyWalletId
            counterPartyUsername
          }
          ... on InitiationViaLn {
            paymentHash
          }
          ... on InitiationViaOnChain {
            address
          }
        }
        settlementVia {
          __typename
          ... on SettlementViaIntraLedger {
            counterPartyWalletId
            counterPartyUsername
          }
          ... on SettlementViaLn {
            paymentSecret
          }
          ... on SettlementViaOnChain {
            transactionHash
          }
        }
      }
    }
  }
`

export const MAIN_QUERY = gql`
  query mainQuery($hasToken: Boolean!) {
    globals {
      nodesIds
      network
    }
    quizQuestions {
      id
      earnAmount
    }
    btcPrice {
      __typename
      base
      offset
      currencyUnit
      formattedAmount
    }
    me @include(if: $hasToken) {
      id
      language
      username
      phone
      quizQuestions {
        question {
          id
          earnAmount
        }
        completed
      }
      defaultAccount {
        id
        defaultWalletId
        transactions(first: 3) {
          ...TransactionList
        }
        wallets {
          id
          balance
          walletCurrency
        }
      }
    }
    mobileVersions {
      platform
      currentSupported
      minSupported
    }
  }
  ${TRANSACTION_LIST_FRAGMENT}
`

export const TRANSACTIONS_LIST = gql`
  query transactionsList($first: Int, $after: String) {
    me {
      id
      defaultAccount {
        id
        wallets {
          id
          walletCurrency
          transactions(first: $first, after: $after) {
            ...TransactionList
          }
        }
      }
    }
  }
  ${TRANSACTION_LIST_FRAGMENT}
`

export const getQuizQuestions = (client: MockableApolloClient, { hasToken }) => {
  const data = client.readQuery({
    query: MAIN_QUERY,
    variables: { hasToken },
  })

  const allQuestions: Record<string, number> | null = data?.quizQuestions
    ? data.quizQuestions.reduce((acc, curr) => {
        acc[curr.id] = curr.earnAmount
        return acc
      }, {})
    : null

  const myCompletedQuestions: Record<string, number> | null = data?.me?.quizQuestions
    ? data?.me?.quizQuestions.reduce((acc, curr) => {
        if (curr.completed) {
          acc[curr.question.id] = curr.question.earnAmount
        }
        return acc
      }, {})
    : null

  return {
    allQuestions,
    myCompletedQuestions,
  }
}
