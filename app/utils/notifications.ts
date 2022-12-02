import { ApolloClient } from "@apollo/client"
import { MUTATIONS } from "@galoymoney/client"
import messaging from "@react-native-firebase/messaging"

// No op if the permission has already been requested
export const requestNotificationPermission = () => messaging().requestPermission()

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

export const hasNotificationPermission = async (): Promise<boolean> => {
  const authorizationStatus = await messaging().hasPermission()

  return (
    authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL
  )
}
