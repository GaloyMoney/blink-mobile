import * as React from "react"
import { StoryScreen } from "../../../.storybook/views"
import { DisplayCurrencyScreen } from "./display-currency-screen"
import { Meta } from "@storybook/react"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"
import mocks from "../../graphql/mocks"

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
