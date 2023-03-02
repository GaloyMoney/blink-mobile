import * as React from "react"
import { PersistentStateWrapper, StoryScreen } from "../../../.storybook/views"
import { DisplayCurrencyScreen } from "./display-currency-screen"
import { ComponentMeta } from "@storybook/react"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"
import { mocksDisplayCurrencyScreen } from "./display-currency.mock"

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
  <MockedProvider mocks={mocksDisplayCurrencyScreen} cache={createCache()}>
    <IsAuthedContextProvider value={true}>
      <DisplayCurrencyScreen />
    </IsAuthedContextProvider>
  </MockedProvider>
)
