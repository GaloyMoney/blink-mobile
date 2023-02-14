import messaging from "@react-native-firebase/messaging"
import crashlytics from "@react-native-firebase/crashlytics"
import { uploadDeviceToken } from "@app/modules/market-place/graphql"

// No op if the permission has already been requested
export const requestNotificationPermission = () => messaging().requestPermission()

export const addDeviceToken = async (): Promise<void> => {
  try {
    const deviceToken = await messaging().getToken()
    await uploadDeviceToken(deviceToken)
  } catch (err) {
    crashlytics().recordError(err)
    console.error(err, "impossible to upload device token")
  }
}

export const hasNotificationPermission = async (): Promise<boolean> => {
  const authorizationStatus = await messaging().requestPermission()

  return (
    authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL
  )
}
