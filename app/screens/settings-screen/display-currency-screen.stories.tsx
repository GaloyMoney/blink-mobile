import * as React from "react"

import { MockedProvider } from "@apollo/client/testing"
import { Meta } from "@storybook/react"

import { StoryScreen } from "../../../.storybook/views"
import { createCache } from "../../graphql/cache"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"
import mocks from "../../graphql/mocks"
import { DisplayCurrencyScreen } from "./display-currency-screen"

export default {
  title: "DisplayCurrency Screen",
  component: DisplayCurrencyScreen,
  decorators: [(Story) => <StoryScreen>{Story()}</StoryScreen>],
} as Meta<typeof DisplayCurrencyScreen>

export const Default = () => (
  <MockedProvider mocks={mocks} cache={createCache()}>
    <IsAuthedContextProvider value={true}>
      <DisplayCurrencyScreen />
    </IsAuthedContextProvider>
  </MockedProvider>
)
