import { useFocusEffect } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
import { useCallback } from "react"
// eslint-disable-next-line react-native/split-platform-components
import { Dimensions } from "react-native"
import { Region } from "react-native-maps"
import Geolocation from "@react-native-community/geolocation"
import { Screen } from "../../components/screen"
import { RootStackParamList } from "../../navigation/stack-param-lists"
import { toastShow } from "../../utils/toast"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useBusinessMapMarkersQuery } from "@app/graphql/generated"
import { gql } from "@apollo/client"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { PhoneLoginInitiateType } from "../phone-auth-screen"
import countryCodes from "../../../utils/countryInfo.json"
import { CountryCode } from "libphonenumber-js/mobile"
import useDeviceLocation from "@app/hooks/use-device-location"
import MapInterface, { MarkerData } from "@app/components/map-interface"

const EL_ZONTE_COORDS = {
  latitude: 13.496743,
  longitude: -89.439462,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
}

// essentially calculates zoom for location being set based on country
const { height, width } = Dimensions.get("window")
const LATITUDE_DELTA = 15 // <-- decrease for more zoom
const LONGITUDE_DELTA = LATITUDE_DELTA * (width / height)

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "Primary">
}

type GeolocationPermissionNegativeError = {
  code: number
  message: string
  PERMISSION_DENIED: number
  POSITION_UNAVAILABLE: number
  TIMEOUT: number
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
  const { LL } = useI18nContext()

  const { data, error, refetch } = useBusinessMapMarkersQuery({
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  })

  const [userLocation, setUserLocation] = React.useState<Region>()
  const [isRefreshed, setIsRefreshed] = React.useState(false)
  const [focusedMarker, setFocusedMarker] = React.useState<MarkerData | null>(null)
  const [wasLocationDenied, setLocationDenied] = React.useState(false)

  useFocusEffect(() => {
    if (!isRefreshed) {
      setIsRefreshed(true)
      refetch()
    }
  })

  if (error) {
    toastShow({ message: error.message, LL })
  }

  // if getting location was denied and device's country code has been found (or defaulted)
  // this is used to finalize the initial location shown on the Map
  React.useEffect(() => {
    if (countryCode && wasLocationDenied && !loading) {
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
        setUserLocation(region)
      } else {
        // backup if country code is not recognized
        setUserLocation(EL_ZONTE_COORDS)
      }
    }
  }, [wasLocationDenied, countryCode, loading, setUserLocation])

  const handleCalloutPress = (item: MarkerData | null) => {
    if (isAuthed && item?.username) {
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

  const getUserRegion = (callback: (region?: Region) => void) => {
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

  const requestLocationPermission = useCallback(() => {
    const permittedResponse = () => {
      getUserRegion(async (region) => {
        if (region) {
          setUserLocation(region)
        } else {
          setLocationDenied(true)
        }
      })
    }

    const negativeResponse = (error: GeolocationPermissionNegativeError) => {
      console.debug("Permission location denied: ", error)
      setLocationDenied(true)
    }

    Geolocation.requestAuthorization(permittedResponse, negativeResponse)
    // disable eslint because we only want to ask for permissions once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => requestLocationPermission(), [requestLocationPermission])

  return (
    <Screen>
      {userLocation && (
        <MapInterface
          data={data}
          userLocation={userLocation}
          handleMapPress={() => setFocusedMarker(null)}
          handleMarkerPress={(item) => setFocusedMarker(item)}
          focusedMarker={focusedMarker}
          handleCalloutPress={handleCalloutPress}
        />
      )}
    </Screen>
  )
}
