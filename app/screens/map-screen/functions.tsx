import { Region } from "react-native-maps"
import { PERMISSIONS } from "react-native-permissions"

import { isIos } from "@app/utils/helper"
import Geolocation from "@react-native-community/geolocation"

export const LOCATION_PERMISSION = isIos
  ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
  : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION

export const getUserRegion = (callback: (region?: Region) => void) => {
  try {
    Geolocation.getCurrentPosition(
      (data: GeolocationPosition) => {
        if (data) {
          const region: Region = {
            latitude: data.coords.latitude,
            longitude: data.coords.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }
          callback(region)
        }
      },
      () => {
        callback(undefined)
      },
      { timeout: 5000 },
    )
  } catch (e) {
    callback(undefined)
  }
}
