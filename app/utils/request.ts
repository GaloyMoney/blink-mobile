import { GraphQLClient } from "graphql-request";
import { Token, getGraphQlUri } from "./token";

export const request = (...args) => {
  const token = new Token()

  const graphQLClient = new GraphQLClient(getGraphQlUri(token.network), {
    headers: {
      authorization: token.bearerString,
    },
  })
    
  return graphQLClient.request(...args)
}