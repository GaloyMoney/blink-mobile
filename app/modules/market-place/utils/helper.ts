import { navigate } from "@app/navigation/navigation-container-wrapper";
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Linking, NativeModules, Platform } from "react-native"
import { PuraVidaNotificationTypes } from "../config/constant"
interface RemoteMessage {
  data?: { [key: string]: string };
}
export const emailIsValid = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
export const shuffle = <Type>(array: Type[]): Type[] => {
  let currentIndex = array.length
  let temporaryValue
  let randomIndex

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1

    // And swap it with the current element.
    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }

  return array
}

export const isIos = Platform.OS === "ios"

export const getLocation = (location: { lat?: any; long?: any }) => {
  if (!location || !location?.lat || !location?.long) return ""
  return `Lat: ${location.lat}, Long: ${location.long}`
}
export const openMap = (lat: any, lng: any) => {
  const scheme = Platform.select({ ios: "maps:0,0?q=", android: "geo:0,0?q=" })
  const latLng = `${lat},${lng}`
  const label = "Here"
  const url = Platform.select({
    ios: `${scheme}${label || ""}@${latLng}`,
    android: `${scheme}${latLng}(${label || ""})`,
  })

  Linking.openURL(url)
}

export async function getStorage(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key)
  } catch {
    // not sure why this would fail... even reading the RN docs I'm unclear
    return null
  }
}

/**
 * Saves a string to storage.
 *
 * @param key The key to fetch.
 * @param value The value to store.
 */
export async function saveStorage(key: string, value: string): Promise<boolean> {
  try {
    await AsyncStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

export const deeplinkHandler = (_remoteMessage: RemoteMessage) => {

  switch (_remoteMessage?.data?.type) {
    case PuraVidaNotificationTypes.post: {
      setTimeout(() => {
        navigate("PostDetail", { postId: _remoteMessage?.data?.postId, title: _remoteMessage?.data?.postTitle, })
       }, 1000)
      break;
    }

    default:
      break;
  }
}