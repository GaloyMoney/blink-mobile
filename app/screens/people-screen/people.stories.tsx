import * as React from "react"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"
import { PeopleScreen } from "./people"
import { StoryScreen } from "../../../.storybook/views"
import { Meta } from "@storybook/react-native"

export default {
  title: "People Screen",
  component: PeopleScreen,
  decorators: [(Story) => <StoryScreen>{Story()}</StoryScreen>],
} as Meta<typeof PeopleScreen>

const mocks = []

export const Empty = () => (
  <MockedProvider mocks={mocks} cache={createCache()}>
    <PeopleScreen />
  </MockedProvider>
)
