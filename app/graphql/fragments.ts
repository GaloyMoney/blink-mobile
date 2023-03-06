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
    settlementDisplayAmount
    settlementDisplayCurrency
    settlementPrice {
      base
      offset
      currencyUnit
      formattedAmount
    }

    initiationVia {
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
`
