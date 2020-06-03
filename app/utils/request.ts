import { GraphQLClient } from "graphql-request";
import { GRAPHQL_SERVER_URI } from "../app";
import { Token } from "./token";

export const GraphQLClientWrapper = new GraphQLClient(GRAPHQL_SERVER_URI, {
  headers: {
    authorization: `Bearer ${new Token().get()}`,
  },
})

// export const request = graphQLClient.request