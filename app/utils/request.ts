import { GraphQLClient } from "graphql-request";
import { Token, getGraphQlUri } from "./token";

export const request = async (...args) => {
  const token = new Token()

  const graphQLClient = new GraphQLClient(await getGraphQlUri(), {
    headers: {
      authorization: token.bearerString,
    },
  })
    
  return graphQLClient.request(...args)
}