import React from "react"
import { PersistentStateWrapper, StoryScreen } from "../../../.storybook/views"
import { ComponentMeta } from "@storybook/react"
import { MockedProvider } from "@apollo/client/testing"
import {
  LnNoAmountInvoiceCreateDocument,
  ReceiveBtcDocument,
  ReceiveUsdDocument,
  ReceiveWrapperScreenDocument,
} from "../../graphql/generated"
import { createCache } from "../../graphql/cache"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"
import ReceiveWrapperScreen from "./receive-wrapper"

const mocks = [
  {
    request: {
      query: ReceiveWrapperScreenDocument,
    },
    result: {
      data: {
        // realtimePrice: {
        //   btcSatPrice: {
        //     base: 24120080078,
        //     offset: 12,
        //     currencyUnit: "USDCENT",
        //     __typename: "PriceOfOneSat",
        //   },
        //   denominatorCurrency: "USD",
        //   id: "c3a56244-1000-5c36-a92f-493557e73f05",
        //   timestamp: 1677060131,
        //   usdCentPrice: {
        //     base: 100000000,
        //     offset: 6,
        //     currencyUnit: "USDCENT",
        //     __typename: "PriceOfOneUsdCent",
        //   },
        //   __typename: "RealtimePrice",
        // },
        me: {
          id: "70df9822-efe0-419c-b864-c9efa99872ea",
          defaultAccount: {
            id: "84b26b88-89b0-5c6f-9d3d-fbead08f79d8",
            defaultWallet: {
              walletCurrency: "BTC",
              __typename: "BTCWallet",
              id: "f79792e3-282b-45d4-85d5-7486d020def5",
            },
            __typename: "ConsumerAccount",
          },
          __typename: "User",
        },
      },
    },
  },
  {
    request: {
      query: ReceiveUsdDocument,
    },
    result: {
      data: {
        globals: {
          __typename: "Globals",
          network: "mainnet",
        },
        me: {
          id: "70df9822-efe0-419c-b864-c9efa99872ea",
          defaultAccount: {
            id: "84b26b88-89b0-5c6f-9d3d-fbead08f79d8",
            usdWallet: {
              __typename: "UsdWallet",
              id: "f091c102-6277-4cc6-8d81-87ebf6aaad1b",
            },
            __typename: "ConsumerAccount",
          },
          __typename: "User",
        },
      },
    },
  },
  {
    request: {
      query: ReceiveBtcDocument,
    },
    result: {
      data: {
        globals: {
          network: "mainnet",
          __typename: "Globals",
        },
        me: {
          id: "70df9822-efe0-419c-b864-c9efa99872ea",
          defaultAccount: {
            id: "84b26b88-89b0-5c6f-9d3d-fbead08f79d8",
            __typename: "ConsumerAccount",
            btcWallet: {
              id: "84b26b88-89b0-5c6f-9d3d-fbead08f79d8",
              __typename: "BTCWallet",
            },
          },
          __typename: "User",
        },
      },
    },
  },
  {
    request: {
      query: LnNoAmountInvoiceCreateDocument,
      variables: {
        input: { walletId: "84b26b88-89b0-5c6f-9d3d-fbead08f79d8", memo: undefined },
      },
    },
    result: {
      data: {
        lnNoAmountInvoiceCreate: {
          invoice: {
            paymentRequest:
              "lnbc1p3lwh3npp5z5wkmy86gcww9u2h8tuekqmfz4pwlpkk4rfst8cm7jwzm8fklldsdqqcqzpuxqyz5vqsp52fv968tprd3dqkuqsq78nw8s0xr9zn7rx686ukq2rfnsdf27pwtq9qyyssqhc7m7d3gfvdsywx956d3u3h45xyf7xurc6yv5qxysspjnhhxstl3wet525ldxn3x6xd0g58nk6wuvwle0fhn5sul396za3qs5ma7zxsqjvklym",
            paymentHash:
              "0ab7a842956c260e1270a46d09e964ac15e0623d4f2d8d4b62af5a608f4c5e06",
            paymentSecret:
              "8c92e0f1db2374806ec11e8fea3d1513171bee9304dd54e33a4f2c0347b42006",
            __typename: "LnNoAmountInvoice",
          },
          errors: [],
          __typename: "LnNoAmountInvoicePayload",
        },
      },
    },
  },
]

export default {
  title: "Receive",
  component: ReceiveWrapperScreen,
  decorators: [
    (Story) => (
      <PersistentStateWrapper>
        <MockedProvider mocks={mocks} cache={createCache()}>
          <StoryScreen>{Story()}</StoryScreen>
        </MockedProvider>
      </PersistentStateWrapper>
    ),
  ],
} as ComponentMeta<typeof ReceiveWrapperScreen>

export const Main = () => (
  <IsAuthedContextProvider value={true}>
    <ReceiveWrapperScreen />
  </IsAuthedContextProvider>
)
