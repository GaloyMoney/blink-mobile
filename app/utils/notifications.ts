
import messaging from '@react-native-firebase/messaging'

export const requestPermission = async (store) => {
  const authorizationStatus = await messaging().requestPermission()

  const enabled = authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                  authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL;

  // Alert.alert(`enable: ${enabled ? 'true': 'false'}`)

  if (!enabled) {
    return
  }

  await uploadToken(store)
  // Alert.alert(`token: ${token}`)


  // If using other push notification providers (ie Amazon SNS, etc)
  // you may need to get the APNs token instead for iOS:
  // if(Platform.OS == 'ios') { messaging().getAPNSToken().then(token => { return saveTokenToDatabase(token); }); }

}

export const uploadToken = async (store) => {
  const token =  await messaging().getToken()
  await store.mutateAddDeviceToken({deviceToken: token})
}