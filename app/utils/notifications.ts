import { ApolloClient } from "@apollo/client"
import { MUTATIONS } from "@galoymoney/client"
import messaging from "@react-native-firebase/messaging"

export const requestPermission = async (client: ApolloClient<unknown>): Promise<void> => {
  const authorizationStatus = await messaging().requestPermission()

  const enabled =
    authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL

  // Alert.alert(`enable: ${enabled ? 'true': 'false'}`)

  if (!enabled) {
    return
  }

  await addDeviceToken(client)

  // If using other push notification providers (ie Amazon SNS, etc)
  // you may need to get the APNs token instead for iOS:
  // if(Platform.OS == 'ios') { messaging().getAPNSToken().then(token => { return saveTokenToDatabase(token); }); }
}

export const addDeviceToken = async (client: ApolloClient<unknown>): Promise<void> => {
  try {
    const deviceToken = await messaging().getToken()

    await client.mutate({
      mutation: MUTATIONS.deviceNotificationTokenCreate,
      variables: { input: { deviceToken } },
    })
  } catch (err) {
    console.error(err, "impossible to upload device token")
  }
}

export const hasFullPermissions = async (): Promise<boolean> => {
  const authorizationStatus = await messaging().hasPermission()

  let hasPermissions = false

  if (authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED) {
    hasPermissions = true
    console.debug("User has notification permissions enabled.")
  } else if (authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL) {
    console.debug("User has provisional notification permissions.")
  } else {
    console.debug("User has notification permissions disabled")
  }

  return hasPermissions
}
