
// TODO maybe merge with in RootStore?

// const gql_query = `
// query home($isLogged: Boolean!) {
//   prices {
//     __typename
//     id
//     o
//   }
//   earnList {
//     __typename
//     id
//     value
//     completed @include(if: $isLogged)
//   }
//   wallet @include(if: $isLogged) {
//     __typename
//     id
//     balance
//     currency
//   }
//   me @include(if: $isLogged) {
//     __typename
//     id
//     level
//   }
// }
// `

import { Token } from "./token"

const gql_query_logged = `
query gql_query_logged {
  prices {
    __typename
    id
    o
  }
  earnList {
    __typename
    id
    value
    completed
  }
  wallet {
    __typename
    id
    balance
    currency
    transactions {
      __typename
      id
      amount
      description
      created_at
      hash
      type
      usd
    }
  }
  getLastOnChainAddress {
    __typename
    id
  }
  me {
    __typename
    id
    level
  }
}
`

const gql_query_anonymous = `
query gql_query_anonymous {
  prices {
    __typename
    id
    o
  }
  earnList {
    __typename
    id
    value
  }
}
`

export const getMainQuery = () => new Token().has() ? gql_query_logged : gql_query_anonymous

