import { MockedProvider } from "@apollo/client/testing"
import { Meta } from "@storybook/react"
import React from "react"
import { StoryScreen } from "../../../.storybook/views"
import { createCache } from "../../graphql/cache"
import mocks from "../../graphql/mocks"
import { UpgradeAccountModal } from "./upgrade-account-modal"
import { Button, View } from "react-native"

export default {
  title: "Upgrade account modal",
  component: UpgradeAccountModal,
  decorators: [
    (Story) => (
      <MockedProvider mocks={[...mocks]} cache={createCache()} addTypename={false}>
        <StoryScreen>{Story()}</StoryScreen>
      </MockedProvider>
    ),
  ],
} as Meta<typeof UpgradeAccountModal>

export const Default = () => {
  const [isVisible, setIsVisible] = React.useState(true)
  return (
    <View>
      <Button title="Show modal" onPress={() => setIsVisible(true)} />
      <UpgradeAccountModal isVisible={isVisible} closeModal={() => setIsVisible(false)} />
    </View>
  )
}
