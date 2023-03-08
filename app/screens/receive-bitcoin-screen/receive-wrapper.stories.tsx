import { MockedProvider } from "@apollo/client/testing"
import { ComponentMeta } from "@storybook/react"
import React from "react"
import { PersistentStateWrapper, StoryScreen } from "../../../.storybook/views"
import { createCache } from "../../graphql/cache"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"
import mocks from "../../graphql/mocks"
import ReceiveWrapperScreen from "./receive-wrapper"

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
