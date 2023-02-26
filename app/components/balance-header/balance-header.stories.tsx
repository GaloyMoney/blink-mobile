import React from "react"
import { BalanceHeader } from "./balance-header"
import { PersistentStateWrapper, StoryScreen } from "../../../.storybook/views"
import { ComponentMeta } from "@storybook/react"
import { MockedProvider } from "@apollo/client/testing"
import {
  BalanceHeaderDocument,
  CurrencyListDocument,
  DisplayCurrencyDocument,
} from "../../graphql/generated"
import { createCache } from "../../graphql/cache"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"

export default {
  title: "Balance Header",
  component: BalanceHeader,
  decorators: [
    (Story) => (
      <PersistentStateWrapper>
        <MockedProvider mocks={mocksBalanceHeader} cache={createCache()}>
          <StoryScreen>{Story()}</StoryScreen>
        </MockedProvider>
      </PersistentStateWrapper>
    ),
  ],
} as ComponentMeta<typeof BalanceHeader>

export const mocksBalanceHeader = [
  {
    request: {
      query: BalanceHeaderDocument,
    },
    result: {
      data: {
        me: {
          id: "70df9822-efe0-419c-b864-c9efa99872ea",
          defaultAccount: {
            id: "84b26b88-89b0-5c6f-9d3d-fbead08f79d8",
            __typename: "ConsumerAccount",
            btcWallet: {
              __typename: "BTCWallet",
              displayBalance: 158,
            },
            usdWallet: {
              __typename: "UsdWallet",
              displayBalance: 158,
            },
          },
          __typename: "User",
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
]

export const Unauthed = () => (
  <IsAuthedContextProvider value={false}>
    <BalanceHeader loading={false} />
  </IsAuthedContextProvider>
)

export const Authed = () => (
  <IsAuthedContextProvider value={true}>
    <BalanceHeader loading={false} />
  </IsAuthedContextProvider>
)
