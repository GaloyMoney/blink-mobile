import { ApolloClient, gql } from "@apollo/client"
import messaging from "@react-native-firebase/messaging"
import crashlytics from "@react-native-firebase/crashlytics"
import { DeviceNotificationTokenCreateDocument } from "@app/graphql/generated"
// eslint-disable-next-line react-native/split-platform-components
import { Platform, PermissionsAndroid } from "react-native"
import { sleep } from "./sleep"

// No op if the permission has already been requested
export const requestNotificationPermission = () => messaging().requestPermission()

gql`
  mutation deviceNotificationTokenCreate($input: DeviceNotificationTokenCreateInput!) {
    deviceNotificationTokenCreate(input: $input) {
      errors {
        message
      }
      success
    }
  }
`

export const addDeviceToken = async (client: ApolloClient<unknown>): Promise<void> => {
  try {
    // we get some concurrency issues where, in rare case, the request is sent twice and our backend doesn't support it
    await sleep(Math.random() * 5000)

    const deviceToken = await messaging().getToken()
    await client.mutate({
      mutation: DeviceNotificationTokenCreateDocument,
      variables: { input: { deviceToken } },
    })
  } catch (err: unknown) {
    if (err instanceof Error) {
      crashlytics().recordError(err)
    }
    console.error(err, "impossible to upload device token")
  }
}

export const hasNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS === "ios") {
    const authorizationStatus = await messaging().hasPermission()
    return (
      authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL
    )
  }

  if (Platform.OS === "android") {
    const authorizationStatusAndroid = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    )
    return authorizationStatusAndroid === PermissionsAndroid.RESULTS.GRANTED || false
  }

  return false
}
