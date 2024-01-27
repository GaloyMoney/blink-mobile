import { InMemoryCache, gql } from "@apollo/client"
import { relayStylePagination } from "@apollo/client/utilities"

gql`
  query realtimePrice {
    me {
      id
      defaultAccount {
        id
        realtimePrice {
          btcSatPrice {
            base
            offset
          }
          denominatorCurrency
          id
          timestamp
          usdCentPrice {
            base
            offset
          }
        }
      }
    }
  }
`

export const createCache = () =>
  new InMemoryCache({
    possibleTypes: {
      // TODO: add other possible types
      Account: ["ConsumerAccount"],
    },
    typePolicies: {
      Globals: {
        // singleton: only cache latest version:
        // https://www.apollographql.com/docs/react/caching/cache-configuration/#customizing-cache-ids
        keyFields: [],
      },
      RealtimePrice: {
        keyFields: [],
      },
      MapMarker: {
        keyFields: ["mapInfo", ["title", "coordinates"]],
      },
      Contact: {
        fields: {
          prettyName: {
            read(_, { readField }) {
              return readField("id") || readField("name")
            },
          },
        },
      },
      UserContact: {
        fields: {
          transactions: relayStylePagination(),
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
          beta: {
            read: (value) => value ?? false,
          },
          colorScheme: {
            read: (value) => value ?? "system",
          },
          countryCode: {
            read: (value) => value ?? "SV",
          },
          region: {
            read: (value) => value ?? null,
          },
          feedbackModalShown: {
            read: (value) => value ?? false,
          },
          hasPromptedSetDefaultAccount: {
            read: (value) => value ?? false,
          },
          introducingCirclesModalShown: {
            read: (value) => value ?? false,
          },
          innerCircleValue: {
            read: (value) => value ?? -1,
          },
        },
      },
      Wallet: {
        fields: {
          transactions: relayStylePagination(),
        },
      },
      Account: {
        fields: {
          transactions: relayStylePagination(),
        },
      },
    },
  })
