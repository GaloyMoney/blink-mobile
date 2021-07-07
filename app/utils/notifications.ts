import { gql } from "@apollo/client"
import messaging from "@react-native-firebase/messaging"
import { walletIsActive } from "../graphql/query"

export const requestPermission = async (client) => {
  const authorizationStatus = await messaging().requestPermission()

  const enabled =
    authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL

  // Alert.alert(`enable: ${enabled ? 'true': 'false'}`)

  if (!enabled || !walletIsActive(client)) {
    return
  }

  await addDeviceToken(client)

  // If using other push notification providers (ie Amazon SNS, etc)
  // you may need to get the APNs token instead for iOS:
  // if(Platform.OS == 'ios') { messaging().getAPNSToken().then(token => { return saveTokenToDatabase(token); }); }
}

export const addDeviceToken = async (client) => {
  if (!walletIsActive(client)) {
    return
  }

  try {
    const token = await messaging().getToken()

    const ADD_DEVICE_TOKEN = gql`
      mutation addDeviceToken($deviceToken: String) {
        addDeviceToken(deviceToken: $deviceToken) {
          success
        }
      }
    `

    const result = await client.mutate({
      mutation: ADD_DEVICE_TOKEN,
      variables: { deviceToken: token },
    })
    console.log({ result })
  } catch (err) {
    console.error(err, "impossible to upload device token")
  }
}

export const hasFullPermissions = async () => {
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
