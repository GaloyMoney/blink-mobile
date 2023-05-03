import React from "react"
import { Text } from "react-native"

import { MockedProvider } from "@apollo/client/testing"
import { makeStyles } from "@rneui/themed"
import { Meta } from "@storybook/react"

import { StoryScreen } from "../../../.storybook/views"
import { createCache } from "../../graphql/cache"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"
import mocks from "../../graphql/mocks"
import CustomModal from "./custom-modal"
import { GaloyIcon } from "../atomic/galoy-icon"

const useStyles = makeStyles((theme) => ({
  modalBodyText: {
    fontSize: 20,
    fontWeight: "400",
    lineHeight: 24,
    color: theme.colors.grey5,
    textAlign: "center",
    maxWidth: "80%",
  },
}))

export default {
  title: "Custom Modal",
  component: CustomModal,
  decorators: [
    (Story) => (
      <MockedProvider mocks={mocks} cache={createCache()}>
        <StoryScreen>{Story()}</StoryScreen>
      </MockedProvider>
    ),
  ],
} as Meta<typeof CustomModal>

export const Default = () => {
  const styles = useStyles()
  return (
    <IsAuthedContextProvider value={true}>
      <CustomModal
        isVisible={true}
        toggleModal={() => {}}
        image={<GaloyIcon name="close-cross-with-background" size={100} />}
        title="Trial account creation failed"
        body={
          <Text style={styles.modalBodyText}>
            Unfortunately, we could not create Trial account on your device.
          </Text>
        }
        primaryButtonTitle="Explore wallet"
        primaryButtonOnPress={() => {}}
        secondaryButtonTitle="Register Phone Account"
        secondaryButtonOnPress={() => {}}
      />
    </IsAuthedContextProvider>
  )
}

export const WithNoSecondaryButton = () => {
  const styles = useStyles()
  return (
    <IsAuthedContextProvider value={true}>
      <CustomModal
        isVisible={true}
        toggleModal={() => {}}
        image={<GaloyIcon name="warning-with-background" size={100} />}
        title="Trial account creation failed"
        body={
          <Text style={styles.modalBodyText}>
            Unfortunately, we could not create Trial account on your device.
          </Text>
        }
        primaryButtonTitle="Explore wallet"
        primaryButtonOnPress={() => {}}
      />
    </IsAuthedContextProvider>
  )
}
