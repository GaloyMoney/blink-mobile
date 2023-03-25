import { useApolloClient } from "@apollo/client"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { deeplinkHandler } from "@app/modules/market-place/utils/helper"
import { addDeviceToken, hasNotificationPermission } from "@app/utils/notifications"
import messaging, { FirebaseMessagingTypes } from "@react-native-firebase/messaging"
import React, { useEffect } from "react"

export const NotificationComponent = (): JSX.Element => {
  const client = useApolloClient()
  const isAuthed = useIsAuthed()

  const showNotification = (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
    if (remoteMessage.notification?.body) {
      // TODO: add notifee library to show local notifications
      console.log(remoteMessage.notification.title || "", remoteMessage.notification.body)
    }
  }

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.debug("onMessage")
      showNotification(remoteMessage)
    })

    return unsubscribe
  }, [])

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
  useEffect(() => {
    // Assume a message-notification contains a "type" property in the data payload of the screen to open

    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage.notification,
      );
      console.log('remote message===:', remoteMessage);

      deeplinkHandler(remoteMessage)
    });

    // Check whether an initial notification is available
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit state:',
            remoteMessage.notification,
          );
          console.log('remote message2===:', remoteMessage);
          deeplinkHandler(remoteMessage)
        }
        // setLoading(false);
      });

      messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('Message handled in the background!', remoteMessage);
      });
  }, []);


  return <></>
}
