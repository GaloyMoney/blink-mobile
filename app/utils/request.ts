import { GraphQLClient } from "graphql-request";
import { Token } from "./token";
import { getGraphQlUri } from "./api_uri";

export const request = (...args) => {
  const bearer_string = `Bearer ${new Token().get()}`

  const graphQLClient = new GraphQLClient(getGraphQlUri(), {
    headers: {
      authorization: bearer_string,
    },
  })
    
  return graphQLClient.request(...args)
}
