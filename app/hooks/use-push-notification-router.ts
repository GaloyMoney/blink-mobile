import {
  PeopleStackParamList,
  PrimaryStackParamList,
} from "@app/navigation/stack-param-lists"
import messaging, { FirebaseMessagingTypes } from "@react-native-firebase/messaging"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { useCallback, useEffect } from "react"

const CirclesNotificationTypes = [
  "InnerCircleGrew",
  "OuterCircleGrew",
  "InnerCircleThisMonthThresholdReached",
  "InnerCircleAllTimeThresholdReached",
  "OuterCircleThisMonthThresholdReached",
  "OuterCircleAllTimeThresholdReached",
  "LeaderboardThisMonthThresholdReached",
  "LeaderboardAllTimeThresholdReached",
]

const usePushNotificationRouter = () => {
  const primaryNavigation = useNavigation<StackNavigationProp<PrimaryStackParamList>>()
  const circlesNavigation = useNavigation<StackNavigationProp<PeopleStackParamList>>()

  const handleNotification = useCallback(
    async (remoteMessage: FirebaseMessagingTypes.RemoteMessage): Promise<void> => {
      // console.log("A new FCM message arrived!", JSON.stringify(remoteMessage))
      const notificationType = remoteMessage.data?.notificationType
      if (notificationType) {
        switch (true) {
          case CirclesNotificationTypes.includes(notificationType):
            primaryNavigation.navigate("People")
            setTimeout(() => circlesNavigation.navigate("circlesDashboard"), 200)
            break
        }
      }
    },
    [circlesNavigation, primaryNavigation],
  )

  useEffect(() => {
    // If the app is running in the foreground
    // messaging().onMessage(async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
    //   handleNotification(remoteMessage)
    // })

    // When the application is running, but in the background.
    messaging().onNotificationOpenedApp(
      (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
        handleNotification(remoteMessage)
      },
    )

    // When the application is opened from a quit state.
    messaging()
      .getInitialNotification()
      .then((remoteMessage: FirebaseMessagingTypes.RemoteMessage | null) => {
        if (remoteMessage) {
          handleNotification(remoteMessage)
        }
      })
  }, [handleNotification])
}

export default usePushNotificationRouter
