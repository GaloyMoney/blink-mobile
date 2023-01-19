import { GraphQLError } from "graphql"
import { GraphQlApplicationError } from "./generated"

export const joinErrorsMessages = (
  errors: readonly GraphQLError[] | readonly GraphQlApplicationError[],
) => {
  return errors.map((err) => err.message).join(", ")
}
