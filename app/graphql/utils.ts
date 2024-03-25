import { GraphQLError } from "graphql"
import { GraphQlApplicationError } from "./generated"
import { ApolloError } from "@apollo/client"

type ErrorInput =
  | readonly GraphQLError[]
  | readonly GraphQlApplicationError[]
  | ApolloError

export const getErrorMessages = (error: ErrorInput): string => {
  if (Array.isArray(error)) {
    return error.map((err) => err.message).join(", ")
  }
  if (error instanceof ApolloError) {
    if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      return error.graphQLErrors.map(({ message }) => message).join("\n ")
    } else if (error.message === "Network request failed") {
      return "Wallet is offline"
    }
    return error.message
  }
  return "Something went wrong"
}
