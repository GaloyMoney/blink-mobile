import * as React from "react"
import { StoryScreen } from "../../../.storybook/views"
import { ComponentMeta } from "@storybook/react"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"
import SendBitcoinSuccessScreen from "./send-bitcoin-success-screen"

export default {
  title: "Send Bitcoin Success Screen",
  component: SendBitcoinSuccessScreen,
  decorators: [(Story) => <StoryScreen>{Story()}</StoryScreen>],
} as ComponentMeta<typeof SendBitcoinSuccessScreen>

export const Default = () => (
  <MockedProvider mocks={[]} cache={createCache()}>
    <IsAuthedContextProvider value={true}>
      <SendBitcoinSuccessScreen />
    </IsAuthedContextProvider>
  </MockedProvider>
)
