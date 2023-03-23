import * as React from "react"
import { PersistentStateWrapper, StoryScreen } from "../../../.storybook/views"
import { ComponentMeta } from "@storybook/react"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"
import { DarkModeDocument } from "../../graphql/generated"
import SendBitcoinSuccessScreen from "./send-bitcoin-success-screen"

const mocks = [
  {
    request: {
      query: DarkModeDocument,
    },
    result: {
      data: {
        // FIXME: doesn't work for some reasons
        darkMode: true,
      },
    },
  },
]

export default {
  title: "Send Bitcoin Success Screen",
  component: SendBitcoinSuccessScreen,
  decorators: [
    (Story) => (
      <PersistentStateWrapper>
        <StoryScreen>{Story()}</StoryScreen>
      </PersistentStateWrapper>
    ),
  ],
} as ComponentMeta<typeof SendBitcoinSuccessScreen>

export const Default = () => (
  <MockedProvider mocks={mocks} cache={createCache()}>
    <IsAuthedContextProvider value={true}>
      <SendBitcoinSuccessScreen />
    </IsAuthedContextProvider>
  </MockedProvider>
)
