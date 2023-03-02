/* eslint-disable */

import * as React from "react"
import { storiesOf } from "@storybook/react-native"
import { StoryScreen, Story, UseCase } from "../../../.storybook/views"
import { TransactionDetailScreen } from "./transaction-detail-screen"
import { MockedProvider } from "@apollo/client/testing"
import { MainAuthedDocument } from "../../graphql/generated"
import { createCache } from "../../graphql/cache"

const mock = [
  {
    request: {
      query: MainAuthedDocument,
    },
    result: {
      data: {
        me: {
          id: "70df9822-efe0-419c-b864-c9efa99872ea",
          language: "",
          username: "test1",
          phone: "+50365055539",
          defaultAccount: {
            id: "84b26b88-89b0-5c6f-9d3d-fbead08f79d8",
            defaultWalletId: "f79792e3-282b-45d4-85d5-7486d020def5",
            transactions: {
              pageInfo: {
                hasNextPage: true,
                hasPreviousPage: false,
                startCursor: "63e685aeaa07c2f5296b9a06",
                endCursor: "63e685a2aa07c2f5296b98e1",
                __typename: "PageInfo",
              },
              edges: [
                {
                  cursor: "63e685aeaa07c2f5296b9a06",
                  node: {
                    __typename: "Transaction",
                    id: "63e685aeaa07c2f5296b9a06",
                    status: "SUCCESS",
                    direction: "RECEIVE",
                    memo: null,
                    createdAt: 1676051886,
                    settlementAmount: 1,
                    settlementFee: 0,
                    settlementCurrency: "USD",
                    settlementPrice: {
                      base: 1000000000000,
                      offset: 12,
                      currencyUnit: "USDCENT",
                      formattedAmount: "1",
                      __typename: "Price",
                    },
                    initiationVia: {
                      counterPartyWalletId: null,
                      counterPartyUsername: null,
                      __typename: "InitiationViaIntraLedger",
                    },
                    settlementVia: {
                      counterPartyWalletId: null,
                      counterPartyUsername: null,
                      __typename: "SettlementViaIntraLedger",
                    },
                  },
                  __typename: "TransactionEdge",
                },
                {
                  cursor: "63e685aeaa07c2f5296b9a03",
                  node: {
                    __typename: "Transaction",
                    id: "63e685aeaa07c2f5296b9a03",
                    status: "SUCCESS",
                    direction: "SEND",
                    memo: null,
                    createdAt: 1676051886,
                    settlementAmount: -92,
                    settlementFee: 0,
                    settlementCurrency: "BTC",
                    settlementPrice: {
                      base: 10869565217,
                      offset: 12,
                      currencyUnit: "USDCENT",
                      formattedAmount: "0.010869565217391304",
                      __typename: "Price",
                    },
                    initiationVia: {
                      counterPartyWalletId: null,
                      counterPartyUsername: null,
                      __typename: "InitiationViaIntraLedger",
                    },
                    settlementVia: {
                      counterPartyWalletId: null,
                      counterPartyUsername: null,
                      __typename: "SettlementViaIntraLedger",
                    },
                  },
                  __typename: "TransactionEdge",
                },
                {
                  cursor: "63e685a2aa07c2f5296b98e1",
                  node: {
                    __typename: "Transaction",
                    id: "63e685a2aa07c2f5296b98e1",
                    status: "SUCCESS",
                    direction: "RECEIVE",
                    memo: null,
                    createdAt: 1676051874,
                    settlementAmount: 2,
                    settlementFee: 0,
                    settlementCurrency: "USD",
                    settlementPrice: {
                      base: 1000000000000,
                      offset: 12,
                      currencyUnit: "USDCENT",
                      formattedAmount: "1",
                      __typename: "Price",
                    },
                    initiationVia: {
                      paymentHash:
                        "9d0bf1eb42753c5a1991998c7cc06ace22ce119cdff4c0a7095284ccaf48e847",
                      __typename: "InitiationViaLn",
                    },
                    settlementVia: {
                      counterPartyWalletId: null,
                      counterPartyUsername: null,
                      __typename: "SettlementViaIntraLedger",
                    },
                  },
                  __typename: "TransactionEdge",
                },
              ],
              __typename: "TransactionConnection",
            },
            wallets: [
              {
                id: "f79792e3-282b-45d4-85d5-7486d020def5",
                balance: 88413,
                walletCurrency: "BTC",
                __typename: "BTCWallet",
              },
              {
                id: "f091c102-6277-4cc6-8d81-87ebf6aaad1b",
                balance: 158,
                walletCurrency: "USD",
                __typename: "UsdWallet",
              },
            ],
            btcWallet: {
              id: "f79792e3-282b-45d4-85d5-7486d020def5",
              balance: 88413,
              displayBalance: 10, // FIXME
            },
            usdWallet: {
              id: "f091c102-6277-4cc6-8d81-87ebf6aaad1b",
              displayBalance: 0.158, // FIXME
            },
            __typename: "ConsumerAccount",
          },
          __typename: "User",
        },
      },
    },
  },
]

const route = {
  key: "transactionDetail",
  name: "transactionDetail",
  params: {
    txid: "63e685aeaa07c2f5296b9a06"
  },
} as const

storiesOf("Transaction Detail", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <MockedProvider mocks={mock} cache={createCache()} >
        <UseCase text="Dollar" usage="The primary.">
          <TransactionDetailScreen route={route} />
        </UseCase>
      </MockedProvider>
    </Story>
  ))
