import { useFocusEffect } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
// eslint-disable-next-line react-native/split-platform-components
import { Alert, Dimensions } from "react-native"
import { Region, MapMarker as MapMarkerType } from "react-native-maps"
import Geolocation from "@react-native-community/geolocation"
import { Screen } from "../../components/screen"
import { RootStackParamList } from "../../navigation/stack-param-lists"
import { toastShow } from "../../utils/toast"
import { useI18nContext } from "@app/i18n/i18n-react"
import {
  MapMarker,
  useBusinessMapMarkersQuery,
  useRegionQuery,
} from "@app/graphql/generated"
import { check, PERMISSIONS, PermissionStatus, RESULTS } from "react-native-permissions"
import { gql } from "@apollo/client"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { PhoneLoginInitiateType } from "../phone-auth-screen"
import countryCodes from "../../../utils/countryInfo.json"
import { CountryCode } from "libphonenumber-js/mobile"
import useDeviceLocation from "@app/hooks/use-device-location"
import MapComponent from "@app/components/map-component"
import { isIos } from "@app/utils/helper"

const EL_ZONTE_COORDS = {
  latitude: 13.496743,
  longitude: -89.439462,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
}

export const LOCATION_PERMISSION = isIos
  ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
  : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION

// essentially calculates zoom for location being set based on country
const { height, width } = Dimensions.get("window")
const LATITUDE_DELTA = 15 // <-- decrease for more zoom
const LONGITUDE_DELTA = LATITUDE_DELTA * (width / height)

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "Primary">
}

Geolocation.setRNConfiguration({
  skipPermissionRequests: true,
  enableBackgroundLocationUpdates: false,
  authorizationLevel: "whenInUse",
  locationProvider: "auto",
})

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

gql`
  query businessMapMarkers {
    businessMapMarkers {
      username
      mapInfo {
        title
        coordinates {
          longitude
          latitude
        }
      }
    }
  }
`

export const MapScreen: React.FC<Props> = ({ navigation }) => {
  const isAuthed = useIsAuthed()
  const { countryCode, loading } = useDeviceLocation()
  const { data: lastRegion, error: lastRegionError } = useRegionQuery()
  const { LL } = useI18nContext()

  const { data, error, refetch } = useBusinessMapMarkersQuery({
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  })

  const focusedMarkerRef = React.useRef<MapMarkerType | null>(null)

  const [initialLocation, setInitialLocation] = React.useState<Region>()
  const [isRefreshed, setIsRefreshed] = React.useState(false)
  const [focusedMarker, setFocusedMarker] = React.useState<MapMarker | null>(null)
  const [isInitializing, setInitializing] = React.useState(true)
  const [permissionsStatus, setPermissionsStatus] = React.useState<PermissionStatus>()

  useFocusEffect(() => {
    if (!isRefreshed) {
      setIsRefreshed(true)
      refetch()
    }
  })

  if (error) {
    toastShow({ message: error.message, LL })
  }

  // On screen load, check (NOT request) if location permissions are given
  React.useEffect(() => {
    ;(async () => {
      const status = await check(LOCATION_PERMISSION)
      setPermissionsStatus(status)
      if (status === RESULTS.GRANTED) {
        getUserRegion(async (region) => {
          if (region) {
            setInitialLocation(region)
          } else {
            setInitializing(false)
          }
        })
      } else {
        setInitializing(false)
      }
    })()
  }, [])

  const alertOnLocationError = React.useCallback(() => {
    Alert.alert(LL.common.error(), LL.MapScreen.error())
  }, [LL])

  React.useEffect(() => {
    if (lastRegionError) {
      setInitializing(false)
      setInitialLocation(EL_ZONTE_COORDS)
      alertOnLocationError()
    }
  }, [lastRegionError, alertOnLocationError])

  // Flow when location permissions are denied
  React.useEffect(() => {
    if (countryCode && lastRegion && !isInitializing && !loading && !initialLocation) {
      // User has used map before, so we use their last viewed coords
      if (lastRegion.region) {
        const { latitude, longitude, latitudeDelta, longitudeDelta } = lastRegion.region
        const region: Region = {
          latitude,
          longitude,
          latitudeDelta,
          longitudeDelta,
        }
        setInitialLocation(region)
        // User is using maps for the first time, so we center on the center of their IP's country
      } else {
        // JSON 'hashmap' with every countrys' code listed with their lat and lng
        const countryCodesToCoords: {
          data: Record<CountryCode, { lat: number; lng: number }>
        } = JSON.parse(JSON.stringify(countryCodes))
        const countryCoords: { lat: number; lng: number } =
          countryCodesToCoords.data[countryCode]
        if (countryCoords) {
          const region: Region = {
            latitude: countryCoords.lat,
            longitude: countryCoords.lng,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }
          setInitialLocation(region)
          // backup if country code is not recognized
        } else {
          setInitialLocation(EL_ZONTE_COORDS)
        }
      }
    }
  }, [isInitializing, countryCode, lastRegion, loading, initialLocation])

  const handleCalloutPress = (item: MapMarker) => {
    if (isAuthed) {
      navigation.navigate("sendBitcoinDestination", { username: item.username })
    } else {
      navigation.navigate("phoneFlow", {
        screen: "phoneLoginInitiate",
        params: {
          type: PhoneLoginInitiateType.CreateAccount,
        },
      })
    }
  }

  const handleMarkerPress = (item: MapMarker, ref?: MapMarkerType) => {
    setFocusedMarker(item)
    if (ref) {
      focusedMarkerRef.current = ref
    }
  }

  const handleMapPress = () => {
    setFocusedMarker(null)
    focusedMarkerRef.current = null
  }

  return (
    <Screen>
      {initialLocation && (
        <MapComponent
          data={data}
          userLocation={initialLocation}
          permissionsStatus={permissionsStatus}
          setPermissionsStatus={setPermissionsStatus}
          handleMapPress={handleMapPress}
          handleMarkerPress={handleMarkerPress}
          focusedMarker={focusedMarker}
          focusedMarkerRef={focusedMarkerRef}
          handleCalloutPress={handleCalloutPress}
          alertOnLocationError={alertOnLocationError}
        />
      )}
    </Screen>
  )
}
