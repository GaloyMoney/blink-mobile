import React from "react"
import { HomeScreen } from "./home-screen"
import { PersistentStateWrapper, StoryScreen } from "../../../.storybook/views"
import { ComponentMeta } from "@storybook/react"
import { MockedProvider } from "@apollo/client/testing"
import { MainAuthedDocument, MainUnauthedDocument } from "../../graphql/generated"
import { createCache } from "../../graphql/cache"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"

export default {
  title: "Home Screen",
  component: HomeScreen,
  decorators: [
    (Story) => (
      <PersistentStateWrapper>
        <MockedProvider mocks={mocks} cache={createCache()}>
          <StoryScreen>{Story()}</StoryScreen>
        </MockedProvider>
      </PersistentStateWrapper>
    ),
  ],
} as ComponentMeta<typeof HomeScreen>

const mocks = [
  {
    request: {
      query: MainUnauthedDocument,
    },
    result: {
      data: {
        __typename: "Query",
        globals: {
          __typename: "Globals",
          network: "mainnet",
        },
        mobileVersions: {
          __typename: "MobileVersions",
          platform: "iOS",
          currentSupported: 100,
          minSupported: 100,
        },
      },
    },
  },
  {
    request: {
      query: MainAuthedDocument,
    },
    result: {
      data: {
        realtimePrice: {
          btcSatPrice: {
            base: 24120080078,
            offset: 12,
            currencyUnit: "USDCENT",
            __typename: "PriceOfOneSat",
          },
          denominatorCurrency: "USD",
          id: "c3a56244-1000-5c36-a92f-493557e73f05",
          timestamp: 1677060131,
          usdCentPrice: {
            base: 100000000,
            offset: 6,
            currencyUnit: "USDCENT",
            __typename: "PriceOfOneUsdCent",
          },
          __typename: "RealtimePrice",
        },
        me: {
          id: "70df9822-efe0-419c-b864-c9efa99872ea",
          language: "",
          username: "test1",
          phone: "+50365055539",
          defaultAccount: {
            id: "84b26b88-89b0-5c6f-9d3d-fbead08f79d8",
            defaultWalletId: "f79792e3-282b-45d4-85d5-7486d020def5",
            displayCurrency: "USD",
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
            __typename: "ConsumerAccount",
          },
          __typename: "User",
        },
      },
    },
  },
]

export const Unauthed = () => (
  <IsAuthedContextProvider value={false}>
    <HomeScreen />
  </IsAuthedContextProvider>
)
export const Authed = () => (
  <IsAuthedContextProvider value={true}>
    <HomeScreen />
  </IsAuthedContextProvider>
)
