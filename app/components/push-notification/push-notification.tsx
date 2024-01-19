import { useApolloClient } from "@apollo/client"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { addDeviceToken, hasNotificationPermission } from "@app/utils/notifications"
import messaging, { FirebaseMessagingTypes } from "@react-native-firebase/messaging"
import { useLinkTo } from "@react-navigation/native"
import React, { useEffect } from "react"

const circlesNotificationTypes = [
  "InnerCircleGrew",
  "OuterCircleGrew",
  "InnerCircleThisMonthThresholdReached",
  "InnerCircleAllTimeThresholdReached",
  "OuterCircleThisMonthThresholdReached",
  "OuterCircleAllTimeThresholdReached",
  "LeaderboardThisMonthThresholdReached",
  "LeaderboardAllTimeThresholdReached",
]

export const PushNotificationComponent = (): JSX.Element => {
  const client = useApolloClient()
  const isAuthed = useIsAuthed()

  const linkTo = useLinkTo()

  useEffect(() => {
    const showNotification = (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      if (remoteMessage.notification?.body) {
        // TODO: add notifee library to show local notifications
        console.log(
          remoteMessage.notification.title || "",
          remoteMessage.notification.body,
        )
      }

      const notificationType = remoteMessage.data?.notificationType ?? ""
      if (
        typeof notificationType === "string" &&
        circlesNotificationTypes.includes(notificationType)
      ) {
        linkTo("/people/circles")
      }

      const linkToScreen = remoteMessage.data?.linkTo ?? ""
      if (typeof linkToScreen === "string") {
        linkTo(linkToScreen)
      }
    }

    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.debug("onMessage")
      showNotification(remoteMessage)
    })

    // When the application is running, but in the background.
    messaging().onNotificationOpenedApp(
      (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
        showNotification(remoteMessage)
      },
    )

    // When the application is opened from a quit state.
    messaging()
      .getInitialNotification()
      .then((remoteMessage: FirebaseMessagingTypes.RemoteMessage | null) => {
        if (remoteMessage) {
          showNotification(remoteMessage)
        }
      })

    return unsubscribe
  }, [linkTo])

  useEffect(() => {
    ;(async () => {
      if (isAuthed && client) {
        const hasPermission = await hasNotificationPermission()
        if (hasPermission) {
          addDeviceToken(client)
          messaging().onTokenRefresh(() => addDeviceToken(client))
        }
      }
    })()
  }, [client, isAuthed])

  return <></>
}
