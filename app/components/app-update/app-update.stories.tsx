import React from "react"
import { AppUpdate } from "./app-update"
import { PersistentStateWrapper, StoryScreen } from "../../../.storybook/views"
import { ComponentMeta } from "@storybook/react"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"
import { MobileUpdateDocument } from "../../graphql/generated"

const updateAvailable = [
  {
    request: {
      query: MobileUpdateDocument,
    },
    result: {
      data: {
        mobileVersions: [
          {
            platform: "android",
            currentSupported: 500,
            minSupported: 400,
          },
          {
            platform: "ios",
            currentSupported: 500,
            minSupported: 400,
          },
        ],
      },
    },
  },
]

const updateRequired = [
  {
    request: {
      query: MobileUpdateDocument,
    },
    result: {
      data: {
        mobileVersions: [
          {
            platform: "android",
            currentSupported: 500,
            minSupported: 450,
          },
          {
            platform: "ios",
            currentSupported: 500,
            minSupported: 450,
          },
        ],
      },
    },
  },
]

// TODO: look at how to use mocks in storybook
// we need to get a consistent number if we don't want to have to update the
// number in the query every time.
//
// alternatively,
// we could use do some math and do currentSupported: getBuildNumber() + 1
//
// jest.mock("react-native-device-info", () => ({
//   getBuildNumber: () => 427,
// }))

export default {
  title: "App Update",
  component: AppUpdate,
  decorators: [
    (Story) => (
      <PersistentStateWrapper>
        <IsAuthedContextProvider value={false}>
          <StoryScreen>{Story()}</StoryScreen>
        </IsAuthedContextProvider>
      </PersistentStateWrapper>
    ),
  ],
} as ComponentMeta<typeof AppUpdate>

export const UpdateAvailable = () => (
  <MockedProvider mocks={updateAvailable} cache={createCache()}>
    <AppUpdate />
  </MockedProvider>
)

export const UpdateRequired = () => (
  <MockedProvider mocks={updateRequired} cache={createCache()}>
    <AppUpdate />
  </MockedProvider>
)
