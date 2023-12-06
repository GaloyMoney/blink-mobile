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
    settlementDisplayFee
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
        paymentRequest
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
        preImage
      }
      ... on SettlementViaOnChain {
        transactionHash
        arrivalInMempoolEstimatedAt
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
