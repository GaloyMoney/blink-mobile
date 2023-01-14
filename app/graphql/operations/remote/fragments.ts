import { gql } from "@apollo/client"

export default gql`
  fragment Transaction on Transaction {
    __typename
    id
    status
    direction
    memo
    createdAt

    settlementAmount
    settlementFee
    settlementCurrency
    settlementPrice {
      base
      offset
      currencyUnit
      formattedAmount
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

  fragment TransactionList on TransactionConnection {
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    edges {
      cursor
      node {
        ...Transaction
      }
    }
  }

  fragment Me on User {
    id
    language
    username
    phone
    defaultAccount {
      id
      defaultWalletId
      transactions(first: $recentTransactions) {
        ...TransactionList
      }
      wallets {
        id
        balance
        walletCurrency
      }
    }
  }
`
