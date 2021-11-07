import { ApolloClient, gql } from "@apollo/client"
import messaging from "@react-native-firebase/messaging"

export const requestPermission = async (): Promise<boolean> => {
  const authorizationStatus = await messaging().requestPermission()

  const enabled =
    authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL

  return enabled

  // If using other push notification providers (ie Amazon SNS, etc)
  // you may need to get the APNs token instead for iOS:
  // if(Platform.OS == 'ios') { messaging().getAPNSToken().then(token => { return saveTokenToDatabase(token); }); }
}

export const hasFullPermissions = async (): Promise<boolean> => {
  const authorizationStatus = await messaging().hasPermission()

  let hasPermissions = false

  if (authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED) {
    hasPermissions = true
    console.log("User has notification permissions enabled.")
  } else if (authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL) {
    console.log("User has provisional notification permissions.")
  } else {
    console.log("User has notification permissions disabled")
  }

  return hasPermissions
}

export const enableAllNotifications = async (
  client: ApolloClient<unknown>,
): Promise<void> => {
  const permissionOk = await requestPermission()

  if (!permissionOk) {
    return
  }

  try {
    const token = await messaging().getToken()

    const ADD_DEVICE_TOKEN = gql`
      mutation deviceNotificationsEnable($deviceToken: String!) {
        deviceNotificationsEnable(
          input: { deviceToken: $deviceToken, notificationKeys: [ALL_NOTIFICATIONS] }
        ) {
          errors {
            message
          }
          success
        }
      }
    `

    await client.mutate({
      mutation: ADD_DEVICE_TOKEN,
      variables: { deviceToken: token },
      refetchQueries: ["mainQuery"],
    })
  } catch (err) {
    console.error(err, "error adding device token")
  }
}

export const disableAllNotifications = async (
  client: ApolloClient<unknown>,
): Promise<void> => {
  try {
    const REMOVE_DEVICE_TOKEN = gql`
      mutation deviceNotificationDisable {
        deviceNotificationsDisable(input: { notificationKeys: [ALL_NOTIFICATIONS] }) {
          errors {
            message
          }
          success
        }
      }
    `

    await client.mutate({
      mutation: REMOVE_DEVICE_TOKEN,
      refetchQueries: ["mainQuery"],
    })
  } catch (err) {
    console.error(err, "error removing device token")
  }
}
