import * as React from "react"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"
import { ContactsScreen } from "./contacts"
import { StoryScreen, Story, UseCase } from "../../../.storybook/views"
import { ComponentMeta } from "@storybook/react-native"

export default {
  title: "Contacts Screen",
  component: ContactsScreen,
  decorators: [(Story) => <StoryScreen>{Story()}</StoryScreen>],
} as ComponentMeta<typeof ContactsScreen>

const mocks = []

export const StylePresets = () => (
  <MockedProvider mocks={mocks} cache={createCache()}>
    <Story>
      <UseCase text="Dollar" usage="The primary.">
        <ContactsScreen />
      </UseCase>
    </Story>
  </MockedProvider>
)
