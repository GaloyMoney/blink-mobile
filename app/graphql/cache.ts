import { InMemoryCache, PossibleTypesMap } from "@apollo/client"
import "moment/locale/es"
import possibleTypes from "@generated/possibleTypes.json"
import { relayStylePagination } from "@apollo/client/utilities"
import * as tslib from "tslib"

const notExtras = ["edges", "pageInfo"]
const getExtras = function (obj) {
  return tslib.__rest(obj, notExtras)
}

export const cache = new InMemoryCache({
  // This is ugly but necessary unfortunately https://github.com/Microsoft/TypeScript/issues/28067
  possibleTypes: possibleTypes as unknown as PossibleTypesMap,
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
    BTCWallet: {
      fields: {
        // transactions: relayStylePagination(),
        transactions: {
          ...relayStylePagination(),
          read: (existing, _a) => {
            const canRead = _a.canRead,
              readField = _a.readField
            if (!existing) return existing
            const edges = []
            let firstEdgeCursor = ""
            let lastEdgeCursor = ""
            existing.edges.forEach(function (edge) {
              if (canRead(readField("node", edge))) {
                edges.push(edge)
                if (edge.cursor) {
                  firstEdgeCursor = firstEdgeCursor || edge.cursor || ""
                  lastEdgeCursor = edge.cursor || lastEdgeCursor
                }
              }
            })
            const _b = existing.pageInfo || {},
              startCursor = _b.startCursor,
              endCursor = _b.endCursor
            return tslib.__assign(tslib.__assign({}, getExtras(existing)), {
              edges: edges,
              pageInfo: tslib.__assign(tslib.__assign({}, existing.pageInfo), {
                startCursor: startCursor || firstEdgeCursor,
                endCursor: endCursor || lastEdgeCursor,
              }),
            })
          },
        },
      },
    },
  },
})
