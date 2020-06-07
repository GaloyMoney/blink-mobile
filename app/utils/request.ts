import { GraphQLClient } from "graphql-request";
import { Token } from "./token";
import { createHttpClient } from "mst-gql";

export const request = (...args) => {
  const token = new Token()

  const graphQLClient = new GraphQLClient(token.graphQlUri, {
    headers: {
      authorization: token.bearerString,
    },
  })
    
  return graphQLClient.request(...args)
}


export const wrapperCreateHttpClient = () => {
  const token = new Token()

  return createHttpClient(token.graphQlUri, {
  headers: {
    authorization: token.bearerString,
  },
})
}