import * as React from "react"

import { MockedProvider } from "@apollo/client/testing"
import { Meta } from "@storybook/react"

import { StoryScreen } from "../../../.storybook/views"
import { createCache } from "../../graphql/cache"
import { SupportChatDocument } from "../../graphql/generated"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"
import { ConversationScreen } from "./conversation"

const mockEmpty = [
  {
    request: {
      query: SupportChatDocument,
    },
    result: {
      data: {
        me: {
          __typename: "User",
          id: "70df9822-efe0-419c-b864-c9efa99872ea",
          supportChat: [],
        },
        __typename: "Query",
      },
    },
  },
]

const mockShort = [
  {
    request: {
      query: SupportChatDocument,
    },
    result: {
      data: {
        me: {
          __typename: "User",
          id: "70df9822-efe0-419c-b864-c9efa99872ea",
          supportChat: [
            {
              __typename: "SupportChat",
              id: "1",
              message: "Hello",
              role: "user",
              timestamp: 1677184189,
            },
            {
              __typename: "SupportChat",
              id: "2",
              message: "Hi",
              role: "assistant",
              timestamp: 1677184190,
            },
          ],
        },
        __typename: "Query",
      },
    },
  },
]

export default {
  title: "Conversation Screen",
  component: ConversationScreen,
  decorators: [(Story) => <StoryScreen>{Story()}</StoryScreen>],
} as Meta<typeof ConversationScreen>

export const Empty = () => (
  <MockedProvider mocks={mockEmpty} cache={createCache()}>
    <IsAuthedContextProvider value={true}>
      <ConversationScreen />
    </IsAuthedContextProvider>
  </MockedProvider>
)

export const Default = () => (
  <MockedProvider mocks={mockShort} cache={createCache()}>
    <IsAuthedContextProvider value={true}>
      <ConversationScreen />
    </IsAuthedContextProvider>
  </MockedProvider>
)
