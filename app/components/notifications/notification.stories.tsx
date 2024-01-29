import React from "react"
import { View } from "react-native"

import { MockedProvider } from "@apollo/client/testing"

import { StoryScreen } from "../../../.storybook/views"
import { createCache } from "../../graphql/cache"
import mocks from "../../graphql/mocks"
import { GaloyPrimaryButton } from "../atomic/galoy-primary-button"
import { NotificationCard, NotificationsProvider, useNotifications } from "./index"

export default {
  title: "Notification",
  component: NotificationsProvider,
  decorators: [
    (Story) => (
      <MockedProvider mocks={mocks} cache={createCache()}>
        <StoryScreen>{Story()}</StoryScreen>
      </MockedProvider>
    ),
  ],
}

const delayFunction = async () => {
  await new Promise((resolve) => {
    setTimeout(resolve, 1000)
  })
}

export const Default = () => {
  const { notifyModal, notifyCard } = useNotifications()
  return (
    <View>
      <GaloyPrimaryButton
        title={"Open modal"}
        onPress={() => {
          notifyModal({
            title: "Login attempt detected",
            icon: "warning",
            text: "Someone tried to login to your device from another account. Was it you?",
            primaryButtonTitle: "Yes, it was me",
            primaryButtonAction: delayFunction,
            secondaryButtonTitle: "No, it wasn't me",
          })
        }}
      />
      <GaloyPrimaryButton
        title={"notifyCard"}
        onPress={() => {
          notifyCard({
            title: "title",
            text: "text",
            icon: "warning",
            action: delayFunction,
          })
        }}
      />
      <NotificationCard />
    </View>
  )
}

export const NotifyTwice = () => {
  const { notifyModal, notifyCard } = useNotifications()
  return (
    <View>
      <GaloyPrimaryButton
        title={"Open modal"}
        onPress={() => {
          notifyModal({
            title: "title",
            text: "text",
            primaryButtonTitle: "primaryButtonTitle",
            primaryButtonAction: delayFunction,
          })
          notifyModal({
            title: "second title",
            text: "text",
            primaryButtonTitle: "primaryButtonTitle",
            primaryButtonAction: delayFunction,
          })
        }}
      />
      <GaloyPrimaryButton
        title={"notifyCard"}
        onPress={() => {
          notifyCard({
            title: "title",
            text: "text",
            action: delayFunction,
          })
          notifyCard({
            title: "second title",
            text: "text",
            action: delayFunction,
          })
        }}
      />
      <NotificationCard />
    </View>
  )
}
