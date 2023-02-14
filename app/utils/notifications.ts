import { ApolloClient, gql } from "@apollo/client"
import messaging from "@react-native-firebase/messaging"
import crashlytics from "@react-native-firebase/crashlytics"
import { DeviceNotificationTokenCreateDocument } from "@app/graphql/generated"

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
  let deviceToken: string | undefined
  try {
    deviceToken = await messaging().getToken()
  } catch (err: unknown) {
    if (err instanceof Error) {
      crashlytics().recordError(err)
    }
    console.error(err, "impossible to get device token")
  }

  if (!deviceToken) return

  try {
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
  const authorizationStatus = await messaging().hasPermission()

  return (
    authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL
  )
}
