import { GraphQLError } from "graphql"

export const joinErrorsMessages = (errors?: readonly GraphQLError[]) => {
  return errors?.map((err) => err.message).join(", ")
}
