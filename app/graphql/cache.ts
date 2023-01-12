import { InMemoryCache } from "@apollo/client"

export const cache = new InMemoryCache({
  typePolicies: {
    Contact: {
      fields: {
        prettyName: {
          read(_, { readField }) {
            return readField("id") || readField("name")
          },
        },
      },
    },
    Earn: {
      fields: {
        completed: {
          read: (value) => value ?? false,
        },
      },
    },
    Query: {
      fields: {
        // local only fields
        hideBalance: {
          read: (value) => value ?? false,
        },
        hiddenBalanceToolTip: {
          read: (value) => value ?? false,
        },
      },
    },
  },
})
