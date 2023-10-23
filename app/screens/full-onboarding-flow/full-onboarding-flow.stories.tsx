import * as React from "react"
import { StoryScreen } from "../../../.storybook/views"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"
import { FullOnboardingFlowScreen } from "./full-onboarding-flow"
import { FullOnboardingScreenDocument } from "../../graphql/generated"

export default {
  title: "Full onboarding screen",
  component: FullOnboardingFlowScreen,
  decorators: [(Story) => <StoryScreen>{Story()}</StoryScreen>],
}

const notStarted = [
  {
    request: {
      query: FullOnboardingScreenDocument,
    },
    result: {
      data: {
        me: {
          id: "id",
          defaultAccount: {
            id: "id",
            onboardingStatus: "NOT_STARTED",
            __typename: "ConsumerAccount",
          },
          __typename: "User",
        },
      },
    },
  },
]

const approved = [
  {
    request: {
      query: FullOnboardingScreenDocument,
    },
    result: {
      data: {
        me: {
          id: "id",
          defaultAccount: {
            id: "id",
            onboardingStatus: "APPROVED",
            __typename: "ConsumerAccount",
          },
          __typename: "User",
        },
      },
    },
  },
]

export const Default = () => (
  <MockedProvider mocks={notStarted} cache={createCache()}>
    <FullOnboardingFlowScreen />
  </MockedProvider>
)

export const Approved = () => (
  <MockedProvider mocks={approved} cache={createCache()}>
    <FullOnboardingFlowScreen />
  </MockedProvider>
)
