import * as React from "react"
import { StoryScreen } from "../../../.storybook/views"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"
import { FullOnboardingFlowScreen } from "./full-onboarding-flow"

export default {
  title: "Full onboarding screen",
  component: FullOnboardingFlowScreen,
  decorators: [(Story) => <StoryScreen>{Story()}</StoryScreen>],
}

export const Default = () => (
  <MockedProvider mocks={[]} cache={createCache()}>
    <IsAuthedContextProvider value={true}>
      <FullOnboardingFlowScreen />
    </IsAuthedContextProvider>
  </MockedProvider>
)
