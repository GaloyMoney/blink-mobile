import { ApolloClient, DocumentNode } from "@apollo/client"
import messaging from "@react-native-firebase/messaging"
import crashlytics from "@react-native-firebase/crashlytics"
import { MUTATIONS } from "@galoymoney/client/dist/graphql/import"

// No op if the permission has already been requested
export const requestNotificationPermission = () => messaging().requestPermission()

export const addDeviceToken = async (client: ApolloClient<unknown>): Promise<void> => {
  try {
    const deviceToken = await messaging().getToken()
    await client.mutate({
      mutation: MUTATIONS.deviceNotificationTokenCreate as unknown as DocumentNode, // FIXME(nb): types
      variables: { input: { deviceToken } },
    })
  } catch (err) {
    crashlytics().recordError(err)
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
