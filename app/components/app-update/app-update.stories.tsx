import React from "react"
import { AppUpdate, AppUpdateModal } from "./app-update"
import { StoryScreen } from "../../../.storybook/views"
import { Meta } from "@storybook/react"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"
import { MobileUpdateDocument } from "../../graphql/generated"
import { GaloyPrimaryButton } from "../../components/atomic/galoy-primary-button"
import { View } from "react-native"

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
      <IsAuthedContextProvider value={false}>
        <StoryScreen>{Story()}</StoryScreen>
      </IsAuthedContextProvider>
    ),
  ],
} as Meta<typeof AppUpdate>

export const UpdateAvailable = () => (
  <MockedProvider mocks={updateAvailable} cache={createCache()}>
    <AppUpdate />
  </MockedProvider>
)

export const UpdateRequiredModal = () => {
  const [visible, setVisible] = React.useState(false)

  const openModal = () => setVisible(true)
  const closeModal = () => setVisible(false)
  return (
    <MockedProvider mocks={updateRequired} cache={createCache()}>
      <View>
        <GaloyPrimaryButton onPress={openModal} title="Open Modal" />

        <AppUpdateModal isVisible={visible} linkUpgrade={closeModal} />
      </View>
    </MockedProvider>
  )
}
