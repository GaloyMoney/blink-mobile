import React from "react"

import { MockedProvider } from "@apollo/client/testing"
import { Meta } from "@storybook/react"

import { StoryScreen } from "../../../.storybook/views"
import { FeatureFlagContext } from "../../config/feature-flags-context"
import { createCache } from "../../graphql/cache"
import mocks from "../../graphql/mocks"
import { GetStartedScreen } from "./get-started-screen"

export default {
  title: "Get started screen",
  component: GetStartedScreen,
  decorators: [
    (Story) => (
      <MockedProvider mocks={[...mocks]} cache={createCache()} addTypename={false}>
        <FeatureFlagContext.Provider
          value={{
            deviceAccountEnabled: true,
          }}
        >
          <StoryScreen>{Story()}</StoryScreen>
        </FeatureFlagContext.Provider>
      </MockedProvider>
    ),
  ],
} as Meta<typeof GetStartedScreen>

export const Default = () => <GetStartedScreen />
