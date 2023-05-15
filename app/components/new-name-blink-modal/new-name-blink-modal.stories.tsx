import { MockedProvider } from "@apollo/client/testing"
import { ComponentMeta } from "@storybook/react"
import React from "react"
import { StoryScreen } from "../../../.storybook/views"
import { createCache } from "../../graphql/cache"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"
import { NewNameBlinkModal } from "./new-name-blink-modal"
import mocks from "../../graphql/mocks"

export default {
  title: "New Name Blink Modal",
  component: NewNameBlinkModal,
  decorators: [
    (Story) => (
      <MockedProvider mocks={mocks} cache={createCache()}>
        <StoryScreen>{Story()}</StoryScreen>
      </MockedProvider>
    ),
  ],
} as ComponentMeta<typeof NewNameBlinkModal>

export const Default = () => (
  <IsAuthedContextProvider value={true}>
    <NewNameBlinkModal />
  </IsAuthedContextProvider>
)
