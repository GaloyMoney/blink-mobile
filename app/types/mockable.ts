import { ApolloClient } from "@apollo/client"

export type MockableApolloClient = ApolloClient<unknown> | { readQuery: () => string }
