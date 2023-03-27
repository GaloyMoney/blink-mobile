import * as React from "react"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"
import { ContactsScreen } from "./contacts"
import { StoryScreen } from "../../../.storybook/views"
import { ComponentMeta } from "@storybook/react-native"

export default {
  title: "Contacts Screen",
  component: ContactsScreen,
  decorators: [(Story) => <StoryScreen>{Story()}</StoryScreen>],
} as ComponentMeta<typeof ContactsScreen>

const mocks = []

export const Empty = () => (
  <MockedProvider mocks={mocks} cache={createCache()}>
    <ContactsScreen />
  </MockedProvider>
)
