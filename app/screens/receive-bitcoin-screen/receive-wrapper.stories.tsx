import { MockedProvider } from "@apollo/client/testing"
import { Meta } from "@storybook/react"
import React from "react"
import { StoryScreen } from "../../../.storybook/views"
import { createCache } from "../../graphql/cache"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"
import mocks from "../../graphql/mocks"
import ReceiveWrapperScreen from "./receive-wrapper"

export default {
  title: "Receive",
  component: ReceiveWrapperScreen,
  decorators: [
    (Story) => (
      <MockedProvider mocks={mocks} cache={createCache()}>
        <StoryScreen>{Story()}</StoryScreen>
      </MockedProvider>
    ),
  ],
} as Meta<typeof ReceiveWrapperScreen>

export const Main = () => (
  <IsAuthedContextProvider value={true}>
    <ReceiveWrapperScreen />
  </IsAuthedContextProvider>
)

Main.play = () => {
  // 4000 sats in the BTC wallet
}
