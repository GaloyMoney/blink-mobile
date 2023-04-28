import React from "react"
import { Text } from "react-native"

import { MockedProvider } from "@apollo/client/testing"
import CloseIconImage from "@app/assets/images/close-img.png"
import Warning from "@app/assets/images/warning.png"
import { makeStyles } from "@rneui/themed"
import { ComponentMeta } from "@storybook/react"

import { StoryScreen } from "../../../.storybook/views"
import { createCache } from "../../graphql/cache"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"
import mocks from "../../graphql/mocks"
import CustomModal from "./custom-modal"

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
} as ComponentMeta<typeof CustomModal>

export const Default = () => {
  const styles = useStyles()
  return (
    <IsAuthedContextProvider value={true}>
      <CustomModal
        isVisible={true}
        toggleModal={() => {}}
        imageSource={CloseIconImage}
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
        imageSource={Warning}
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
