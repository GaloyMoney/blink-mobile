import React, { useEffect } from "react"
import { Linking } from "react-native"
import notifee, { AndroidImportance } from "@notifee/react-native"
import messaging, { FirebaseMessagingTypes } from "@react-native-firebase/messaging"

// hooks
import { useApolloClient } from "@apollo/client"
import { useIsAuthed } from "@app/graphql/is-authed-context"

// utils
import { addDeviceToken, hasNotificationPermission } from "@app/utils/notifications"

export const PushNotificationComponent = (): JSX.Element => {
  const client = useApolloClient()
  const isAuthed = useIsAuthed()

  useEffect(() => {
    const followNotificationLink = (
      remoteMessage: FirebaseMessagingTypes.RemoteMessage,
    ) => {
      try {
        const linkToScreen = remoteMessage.data?.linkTo ?? ""
        if (
          typeof linkToScreen === "string" &&
          linkToScreen &&
          linkToScreen.startsWith("/")
        ) {
          Linking.openURL("blink:" + linkToScreen)
        }
        // linkTo throws an error if the link is invalid
      } catch (error) {
        console.error("Error in showNotification", error)
      }
    }

    // When the application is running, but in the background.
    const unsubscribeBackground = messaging().onNotificationOpenedApp(
      (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
        followNotificationLink(remoteMessage)
      },
    )

    const unsubscribeInApp = messaging().onMessage(async (remoteMessage) => {
      console.log("A new FCM message arrived!", remoteMessage)
      onDisplayNotification(remoteMessage)
    })

    // When the application is opened from a quit state.
    messaging()
      .getInitialNotification()
      .then((remoteMessage: FirebaseMessagingTypes.RemoteMessage | null) => {
        if (remoteMessage) {
          followNotificationLink(remoteMessage)
        }
      })

    return () => {
      unsubscribeInApp()
      unsubscribeBackground()
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      if (isAuthed && client) {
        const hasPermission = await hasNotificationPermission()
        if (hasPermission) {
          addDeviceToken(client)
          const unsubscribeFromRefresh = messaging().onTokenRefresh(() =>
            addDeviceToken(client),
          )
          return unsubscribeFromRefresh
        }
      }
    })()
  }, [client, isAuthed])

  async function onDisplayNotification(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  ) {
    // Request permissions (required for iOS)
    await notifee.requestPermission()

    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: "default",
      name: "Default Channel",
      importance: AndroidImportance.HIGH,
    })
    try {
      // Display a notification
      await notifee.displayNotification({
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        android: {
          channelId,
          smallIcon: "ic_notification", // optional, defaults to 'ic_launcher'.
          color: "#f7de4a",
          // pressAction is needed if you want the notification to open the app when pressed
          pressAction: {
            id: "default",
          },
          importance: AndroidImportance.HIGH,
        },
      })
    } catch (err) {
      console.log("?????????????????????????", err)
    }
  }

  return <></>
}
