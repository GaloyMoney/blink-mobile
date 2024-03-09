import * as React from "react"

import { MockedProvider } from "@apollo/client/testing"
import { Meta } from "@storybook/react-native"

import { StoryScreen } from "../../../.storybook/views"
import { createCache } from "../../graphql/cache"
import mocks from "../../graphql/mocks"
import { PeopleScreen } from "./people"

export default {
  title: "People Screen",
  component: PeopleScreen,
  decorators: [(Story) => <StoryScreen>{Story()}</StoryScreen>],
} as Meta<typeof PeopleScreen>

export const Empty = () => (
  <MockedProvider mocks={mocks} cache={createCache()}>
    <PeopleScreen />
  </MockedProvider>
)
