import * as React from "react"
import { StoryScreen } from "../../../.storybook/views"
import { Meta } from "@storybook/react"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"
import SendBitcoinErrorScreen from "./send-bitcoin-error-screen"

export default {
  title: "Send Bitcoin Error Screen",
  component: SendBitcoinErrorScreen,
  decorators: [(Story) => <StoryScreen>{Story()}</StoryScreen>],
} as Meta<typeof SendBitcoinErrorScreen>

export const Default = () => (
  <MockedProvider mocks={[]} cache={createCache()}>
    <IsAuthedContextProvider value={true}>
      <SendBitcoinErrorScreen
        route={{
          key: "1341",
          name: "sendBitcoinError",
          params: {
            message: "error message",
          },
        }}
      />
    </IsAuthedContextProvider>
  </MockedProvider>
)
