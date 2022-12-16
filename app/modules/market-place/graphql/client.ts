import {
  ApolloClient,
  ApolloLink,
  DefaultOptions,
  from,
  HttpLink,
  InMemoryCache,
  fromPromise,
} from "@apollo/client"

import { getMainDefinition } from "@apollo/client/utilities"
import { setContext } from "@apollo/client/link/context"
import { onError } from "@apollo/client/link/error"
import { createUploadLink } from "apollo-upload-client"
import { scriptHostname } from "../utils/helper"

const attemps = 0
const GRAPHQL_REGTEST_URI = `http://${scriptHostname()}:4002/graphql`
const GRAPHQL_TESTNET_URI = "https://api.pvbtc1.staging.pvbtc.cloud/graphql"
const GRAPHQL_MAINNET_URI = "https://api.production.pvbtc.cloud/graphql"

const GRAPHQL_REGTEST_WS_URI = `ws://${scriptHostname()}:4002/graphql`
const GRAPHQL_TESTNET_WS_URI = "wss://api.pvbtc1.staging.pvbtc.cloud/graphql"
const GRAPHQL_MAINNET_WS_URI = "wss://api.production.pvbtc.cloud/graphql"
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(async ({ message, locations, path }) => {
      switch (message) {
        case "Unauthorized": {
        }
        default:
          console.log(``)
      }
    })
  if (networkError) console.log(`[Network error]: ${networkError}`)
})
const httpLink = createUploadLink({ uri: "https://api-puravida.herokuapp.com/graphql" })
// new HttpLink({
//   uri: `https://api-puravida.herokuapp.com/graphql`,
// })

const authLink = setContext(async (_, { headers }) => {
  // get the authentication token from local storage if it exists
  // const token = localStorage.getItem('token');
  const token = ""
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      token: token ? `${token}` : "",
    },
  }
})

export const cache = new InMemoryCache({ addTypename: false })

const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: "no-cache",
    errorPolicy: "ignore",
  },
  query: {
    fetchPolicy: "no-cache",
    errorPolicy: "all",
  },
}

const client = new ApolloClient({
  // link: authLink.concat(errorLink.concat(©httpLink)),
  link: from([authLink, errorLink, httpLink]),
  cache,
  defaultOptions,
})

export default client
