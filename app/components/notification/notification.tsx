import { useApolloClient } from "@apollo/client"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import {
  PeopleStackParamList,
  PrimaryStackParamList,
} from "@app/navigation/stack-param-lists"
import { addDeviceToken, hasNotificationPermission } from "@app/utils/notifications"
import messaging, { FirebaseMessagingTypes } from "@react-native-firebase/messaging"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
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

export const NotificationComponent = (): JSX.Element => {
  const client = useApolloClient()
  const isAuthed = useIsAuthed()
  const primaryNavigation = useNavigation<StackNavigationProp<PrimaryStackParamList>>()
  const circlesNavigation = useNavigation<StackNavigationProp<PeopleStackParamList>>()

  useEffect(() => {
    const showNotification = (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      if (remoteMessage.notification?.body) {
        // TODO: add notifee library to show local notifications
        console.log(
          remoteMessage.notification.title || "",
          remoteMessage.notification.body,
        )
      }

      const notificationType = remoteMessage.data?.notificationType
      if (notificationType) {
        switch (true) {
          case circlesNotificationTypes.includes(notificationType):
            primaryNavigation.navigate("People")
            setTimeout(() => circlesNavigation.navigate("circlesDashboard"), 200)
            break
        }
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
  }, [circlesNavigation, primaryNavigation])

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
