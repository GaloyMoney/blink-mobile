import * as React from "react"
import { PersistentStateWrapper, StoryScreen } from "../../../.storybook/views"
import { SettingsScreen } from "./settings-screen"
import { ComponentMeta } from "@storybook/react"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"
import { SettingsScreenDocument } from "../../graphql/generated"
import { mocksDisplayCurrencyScreen } from "./display-currency.mock"

const mocksWithUsername = [
  ...mocksDisplayCurrencyScreen,
  {
    request: {
      query: SettingsScreenDocument,
    },
    result: {
      data: {
        me: {
          id: "70df9822-efe0-419c-b864-c9efa99872ea",
          phone: "+50365055539",
          username: "test1",
          language: "",
          defaultAccount: {
            id: "84b26b88-89b0-5c6f-9d3d-fbead08f79d8",
            displayCurrency: "EUR",
            __typename: "ConsumerAccount",
            btcWallet: {
              __typename: "BTCWallet",
              id: "84b26b88-89b0-5c6f-9d3d-fbead08f79d8",
            },
            usdWallet: {
              __typename: "UsdWallet",
              id: "84b26b88-89b0-5c6f-9d3d-fbead08f79d8",
            },
          },
          __typename: "User",
        },
      },
    },
  },
]

const mocksNoUsername = [
  {
    request: {
      query: SettingsScreenDocument,
    },
    result: {
      data: {
        me: {
          id: "70df9822-efe0-419c-b864-c9efa99872ea",
          phone: "+50365055539",
          username: "",
          language: "",
          defaultAccount: {
            id: "84b26b88-89b0-5c6f-9d3d-fbead08f79d8",
            displayCurrency: "EUR",
            __typename: "ConsumerAccount",
            btcWallet: {
              __typename: "BTCWallet",
              id: "84b26b88-89b0-5c6f-9d3d-fbead08f79d8",
            },
            usdWallet: {
              __typename: "UsdWallet",
              id: "84b26b88-89b0-5c6f-9d3d-fbead08f79d8",
            },
          },
          __typename: "User",
        },
      },
    },
  },
]

export default {
  title: "Settings Screen",
  component: SettingsScreen,
  decorators: [
    (Story) => (
      <PersistentStateWrapper>
        <StoryScreen>{Story()}</StoryScreen>
      </PersistentStateWrapper>
    ),
  ],
} as ComponentMeta<typeof SettingsScreen>

export const NotLoggedIn = () => (
  <MockedProvider cache={createCache()}>
    <IsAuthedContextProvider value={false}>
      <SettingsScreen />
    </IsAuthedContextProvider>
  </MockedProvider>
)

export const LoggedInNoUsername = () => (
  <MockedProvider mocks={mocksNoUsername} cache={createCache()}>
    <IsAuthedContextProvider value={true}>
      <SettingsScreen />
    </IsAuthedContextProvider>
  </MockedProvider>
)

export const LoggedInWithUsername = () => (
  <MockedProvider mocks={mocksWithUsername} cache={createCache()}>
    <IsAuthedContextProvider value={true}>
      <SettingsScreen />
    </IsAuthedContextProvider>
  </MockedProvider>
)
