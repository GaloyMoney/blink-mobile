import * as React from "react"
import { PersistentStateWrapper, StoryScreen } from "../../../.storybook/views"
import { DisplayCurrencyScreen } from "./display-currency-screen"
import { ComponentMeta } from "@storybook/react"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"
import { CurrencyListDocument, DisplayCurrencyDocument } from "../../graphql/generated"

const mocks = [
  {
    request: {
      query: CurrencyListDocument,
    },
    result: {
      data: {
        currencyList: [
          {
            code: "USD",
            flag: "🇺🇸",
            name: "US Dollar",
            symbol: "$",
          },
          {
            code: "EUR",
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
          id: "70df9822-efe0-419c-b864-c9efa99872ea",
          defaultAccount: {
            id: "84b26b88-89b0-5c6f-9d3d-fbead08f79d8",
            displayCurrency: "USD",
            __typename: "ConsumerAccount",
          },
          __typename: "User",
        },
      },
    },
  },
]

export default {
  title: "DisplayCurrency Screen",
  component: DisplayCurrencyScreen,
  decorators: [
    (Story) => (
      <PersistentStateWrapper>
        <StoryScreen>{Story()}</StoryScreen>
      </PersistentStateWrapper>
    ),
  ],
} as ComponentMeta<typeof DisplayCurrencyScreen>

export const Default = () => (
  <MockedProvider mocks={mocks} cache={createCache()}>
    <IsAuthedContextProvider value={true}>
      <DisplayCurrencyScreen />
    </IsAuthedContextProvider>
  </MockedProvider>
)
