import { useApolloClient } from "@apollo/client"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useAuthenticationContext } from "@app/navigation/navigation-container-wrapper"
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
  const isAppLocked = useAuthenticationContext().isAppLocked

  useEffect(() => {
    if (isAppLocked) {
      return
    }

    const showNotification = (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      try {
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
        if (
          typeof linkToScreen === "string" &&
          linkToScreen &&
          linkToScreen.startsWith("/")
        ) {
          linkTo(linkToScreen)
        }
        // linkTo throws an error if the link is invalid
      } catch (error) {
        console.error("Error in showNotification", error)
      }
    }

    // When the application is running, but in the background.
    const unsubscribeBackground = messaging().onNotificationOpenedApp(
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

    return () => {
      unsubscribeBackground()
    }
  }, [linkTo, isAppLocked])

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

  return <></>
}
