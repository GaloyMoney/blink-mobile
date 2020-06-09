import { GraphQLClient } from "graphql-request";
import { Token } from "./token";

export const request = (...args) => {
  const token = new Token()

  const graphQLClient = new GraphQLClient(token.graphQlUri, {
    headers: {
      authorization: token.bearerString,
    },
  })
    
  return graphQLClient.request(...args)
}