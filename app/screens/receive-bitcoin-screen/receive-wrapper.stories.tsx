import React from "react"
import { PersistentStateWrapper, StoryScreen } from "../../../.storybook/views"
import { ComponentMeta } from "@storybook/react"
import { MockedProvider } from "@apollo/client/testing"
import {
  CurrencyListDocument,
  DisplayCurrencyDocument,
  LnInvoiceCreateDocument,
  LnNoAmountInvoiceCreateDocument,
  RealtimePriceDocument,
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
  {
    request: {
      query: LnNoAmountInvoiceCreateDocument,
      variables: {
        input: { walletId: "f091c102-6277-4cc6-8d81-87ebf6aaad1b", memo: undefined },
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
  {
    request: {
      query: RealtimePriceDocument,
    },
    result: {
      data: {
        realtimePrice: {
          btcSatPrice: {
            base: 24015009766,
            offset: 12,
            currencyUnit: "USDCENT",
            __typename: "PriceOfOneSat",
          },
          denominatorCurrency: "USD",
          id: "67b6e1d2-04c8-509a-abbd-b1cab08575d5",
          timestamp: 1677184189,
          usdCentPrice: {
            base: 100000000,
            offset: 6,
            currencyUnit: "USDCENT",
            __typename: "PriceOfOneUsdCent",
          },
          __typename: "RealtimePrice",
        },
      },
    },
  },
  {
    request: {
      query: DisplayCurrencyDocument,
    },
    result: {
      data: {
        me: {
          __typename: "User",
          id: "70df9822-efe0-419c-b864-c9efa99872ea",
          defaultAccount: {
            __typename: "ConsumerAccount",
            id: "84b26b88-89b0-5c6f-9d3d-fbead08f79d8",
            displayCurrency: "EUR",
          },
        },
      },
    },
  },
  {
    request: {
      query: CurrencyListDocument,
    },
    result: {
      data: {
        currencyList: [
          {
            __typename: "Currency",
            id: "USD",
            flag: "🇺🇸",
            name: "US Dollar",
            symbol: "$",
          },
          {
            __typename: "Currency",
            id: "EUR",
            flag: "🇪🇺",
            name: "Euro",
            symbol: "€",
          },
        ],
      },
    },
  },
  {
    request: {
      query: LnInvoiceCreateDocument,
      variables: {
        input: {
          walletId: "84b26b88-89b0-5c6f-9d3d-fbead08f79d8",
          amount: 4000,
        },
      },
    },
    result: {
      data: {
        lnInvoiceCreate: {
          invoice: {
            paymentRequest:
              "lnbc40u1p3l39h0pp5refkulpe27nqn2y0s3zp0w6cp9ytsnk8z9azjf8vv3tg6rekthvqdqqcqzpuxqyz5vqsp5vml3855dh0s2gxu08l0254fp79c9a5c5ec99rdtqzjn6jy0vmf8s9qyyssqffc0zsstezkuy4kuz4ngddjw03j0me0k6qcjhl65pqpxczy32qqzsvjtcl8s6mwqkp4zrcwajtv79pv355cmks2d5qtn44ys06gcxwgparfnzt",
            paymentHash:
              "8ade86efb48a39271289c078d7d2fe3a765e0e4a3d74adfdc4fbf57f08c3b87d",
            paymentSecret:
              "9af1183f4cd6626db38bcfc13077642302cde04f6a10ace37ba5af5691559aa8",
            satoshis: 4000,
            __typename: "LnInvoice",
          },
          errors: [],
          __typename: "LnInvoicePayload",
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

Main.play = () => {
  // 4000 sats in the BTC wallet
}
