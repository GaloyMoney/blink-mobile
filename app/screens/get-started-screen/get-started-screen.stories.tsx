import { MockedProvider } from "@apollo/client/testing"
import { ComponentMeta } from "@storybook/react"
import React from "react"
import { StoryScreen } from "../../../.storybook/views"
import { createCache } from "../../graphql/cache"
import { GetStartedScreen } from "./get-started-screen"
import mocks from "../../graphql/mocks"

export default {
  title: "Get started screen",
  component: GetStartedScreen,
  decorators: [
    (Story) => (
      <MockedProvider mocks={mocks} cache={createCache()}>
        <StoryScreen>{Story()}</StoryScreen>
      </MockedProvider>
    ),
  ],
} as ComponentMeta<typeof GetStartedScreen>

export const Default = () => <GetStartedScreen />
