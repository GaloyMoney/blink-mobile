import React from "react"

import { MockedProvider } from "@apollo/client/testing"

import { StoryScreen } from "../../../.storybook/views"
import { createCache } from "../../graphql/cache"
import mocks from "../../graphql/mocks"
import { NotificationModalProvider, useNotificationModal } from "./index"
import { GaloyPrimaryButton } from "../atomic/galoy-primary-button"

export default {
  title: "Notification Modal",
  component: NotificationModalProvider,
  decorators: [
    (Story) => (
      <MockedProvider mocks={mocks} cache={createCache()}>
        <StoryScreen>{Story()}</StoryScreen>
      </MockedProvider>
    ),
  ],
}

export const Default = () => {
  const { notify } = useNotificationModal()
  return (
    <GaloyPrimaryButton
      title={"Open modal"}
      onPress={() => {
        notify({
          title: "Login attempt detected",
          icon: "warning",
          text: "Someone tried to login to your device from another account. Was it you?",
          primaryButtonTitle: "Yes, it was me",
          primaryButtonAction: () => Promise.resolve(),
          secondaryButtonTitle: "No, it wasn't me",
        })
      }}
    />
  )
}

export const NotifyTwice = () => {
  const { notify } = useNotificationModal()
  return (
    <GaloyPrimaryButton
      title={"Open modal"}
      onPress={() => {
        notify({
          title: "title",
          text: "text",
          primaryButtonTitle: "primaryButtonTitle",
          primaryButtonAction: () => Promise.resolve(),
        })
        notify({
          title: "second title",
          text: "text",
          primaryButtonTitle: "primaryButtonTitle",
          primaryButtonAction: () => Promise.resolve(),
        })
      }}
    />
  )
}
