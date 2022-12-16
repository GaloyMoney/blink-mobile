import {
  ApolloClient,
  DefaultOptions,
  from,
  InMemoryCache,
} from "@apollo/client"

import { setContext } from "@apollo/client/link/context"
import { onError } from "@apollo/client/link/error"
import { createUploadLink } from "apollo-upload-client"
import { GRAPHQL_MARKET_PLACE_URI } from "../config"

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
const httpLink = createUploadLink({ uri: GRAPHQL_MARKET_PLACE_URI })
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
