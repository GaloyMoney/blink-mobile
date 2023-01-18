import { gql } from "@apollo/client"
import { useDeviceNotificationTokenCreateMutation } from "@app/graphql/generated"
import crashlytics from "@react-native-firebase/crashlytics"
import messaging from "@react-native-firebase/messaging"

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

export const useAddDeviceToken = async () => {
  let deviceToken: string | undefined

  try {
    deviceToken = await messaging().getToken()
  } catch (err) {
    if (err instanceof Error) {
      crashlytics().recordError(err)
    }
    console.error(err, "impossible to upload device token")
  }

  const [addDeviceToken] = useDeviceNotificationTokenCreateMutation()

  if (deviceToken) {
    return addDeviceToken({ variables: { input: { deviceToken } } })
  }

  return null
}

export const hasNotificationPermission = async (): Promise<boolean> => {
  const authorizationStatus = await messaging().hasPermission()

  return (
    authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL
  )
}
