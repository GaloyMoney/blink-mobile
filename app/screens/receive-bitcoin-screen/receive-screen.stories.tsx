import { MockedProvider } from "@apollo/client/testing"
import { Meta } from "@storybook/react"
import React from "react"
import { StoryScreen } from "../../../.storybook/views"
import { createCache } from "../../graphql/cache"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"
import mocks from "../../graphql/mocks"
import ReceiveScreen from "./receive-screen"

export default {
  title: "Receive",
  component: ReceiveScreen,
  decorators: [
    (Story) => (
      <MockedProvider mocks={mocks} cache={createCache()}>
        <StoryScreen>{Story()}</StoryScreen>
      </MockedProvider>
    ),
  ],
} as Meta<typeof ReceiveScreen>

export const Default = () => (
  <IsAuthedContextProvider value={true}>
    <ReceiveScreen />
  </IsAuthedContextProvider>
)

Default.play = () => {
  // 4000 sats in the BTC wallet
}
