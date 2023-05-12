import { MockedProvider } from "@apollo/client/testing"
import { ComponentMeta } from "@storybook/react"
import React from "react"
import { StoryScreen } from "../../../.storybook/views"
import { createCache } from "../../graphql/cache"
import { GetStartedScreen } from "./get-started-screen"
import mocks from "../../graphql/mocks"
import { FeatureFlagContext } from "../../config/feature-flags-context"

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
} as ComponentMeta<typeof GetStartedScreen>

export const Default = () => <GetStartedScreen />
