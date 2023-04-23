import { MockedProvider } from "@apollo/client/testing"
import { ComponentMeta } from "@storybook/react"
import React from "react"
import { StoryScreen } from "../../../.storybook/views"
import { createCache } from "../../graphql/cache"
import { Chat } from "./index"
import mocks from "../../graphql/mocks"

export default {
  title: "ChatBox",
  component: Chat,
  decorators: [
    (Story) => (
      <MockedProvider mocks={mocks} cache={createCache()}>
        <StoryScreen>{Story()}</StoryScreen>
      </MockedProvider>
    ),
  ],
} as ComponentMeta<typeof Chat>

export const Default = () => <Chat />
