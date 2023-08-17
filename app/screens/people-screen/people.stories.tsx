import * as React from "react"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"
import { PeopleScreen } from "./people"
import { StoryScreen } from "../../../.storybook/views"
import { Meta } from "@storybook/react-native"
import mocks from "../../graphql/mocks"

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
