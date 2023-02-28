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
            flag: "🇺🇸",
            id: "USD",
            name: "US Dollar",
            symbol: "$",
            __typename: "Currency",
          },
          {
            flag: "🇪🇺",
            id: "EUR",
            name: "Euro",
            symbol: "€",
            __typename: "Currency",
          },
          {
            flag: "🇳🇬",
            id: "NGN",
            name: "Nigerian Naira",
            symbol: "₦",
            __typename: "Currency",
          },
          {
            flag: "",
            id: "XAF",
            name: "CFA Franc BEAC",
            symbol: "FCFA",
            __typename: "Currency",
          },
          {
            flag: "🇵🇪",
            id: "PEN",
            name: "Peruvian Nuevo Sol",
            symbol: "S/.",
            __typename: "Currency",
          },
          {
            flag: "🇨🇴",
            id: "COP",
            name: "Colombian Peso",
            symbol: "$",
            __typename: "Currency",
          },
          {
            flag: "🇧🇷",
            id: "BRL",
            name: "Brazilian Real",
            symbol: "R$",
            __typename: "Currency",
          },
          {
            flag: "🇬🇹",
            id: "GTQ",
            name: "Guatemalan Quetzal",
            symbol: "Q",
            __typename: "Currency",
          },
          {
            flag: "🇨🇷",
            id: "CRC",
            name: "Costa Rican Colón",
            symbol: "₡",
            __typename: "Currency",
          },
          {
            flag: "🇹🇷",
            id: "TRY",
            name: "Turkish Lira",
            symbol: "₤",
            __typename: "Currency",
          },
          {
            flag: "🇮🇳",
            id: "INR",
            name: "Indian Rupee",
            symbol: "₹",
            __typename: "Currency",
          },
          {
            flag: "🇹🇹",
            id: "TTD",
            name: "Trinidad and Tobago Dollar",
            symbol: "TT$",
            __typename: "Currency",
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
