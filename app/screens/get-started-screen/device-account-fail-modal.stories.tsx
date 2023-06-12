import { MockedProvider } from "@apollo/client/testing"
import { Meta } from "@storybook/react"
import React from "react"
import { StoryScreen } from "../../../.storybook/views"
import { createCache } from "../../graphql/cache"
import mocks from "../../graphql/mocks"
import { DeviceAccountFailModal } from "./device-account-fail-modal"
import { Button, View } from "react-native"

export default {
  title: "Failed device account modal",
  component: DeviceAccountFailModal,
  decorators: [
    (Story) => (
      <MockedProvider mocks={[...mocks]} cache={createCache()} addTypename={false}>
        <StoryScreen>{Story()}</StoryScreen>
      </MockedProvider>
    ),
  ],
} as Meta<typeof DeviceAccountFailModal>

export const Default = () => {
  const [isVisible, setIsVisible] = React.useState(true)
  return (
    <View>
      <Button title="Show modal" onPress={() => setIsVisible(true)} />
      <DeviceAccountFailModal
        isVisible={isVisible}
        closeModal={() => setIsVisible(false)}
        navigateToPhoneLogin={() => {}}
        navigateToHomeScreen={() => {}}
      />
    </View>
  )
}
