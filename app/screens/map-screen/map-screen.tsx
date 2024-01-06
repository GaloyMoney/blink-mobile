import { useFocusEffect } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
// eslint-disable-next-line react-native/split-platform-components
import { Dimensions } from "react-native"
import { Region, MapMarker as MapMarkerType } from "react-native-maps"
import Geolocation from "@react-native-community/geolocation"
import { Screen } from "../../components/screen"
import { RootStackParamList } from "../../navigation/stack-param-lists"
import { toastShow } from "../../utils/toast"
import { useI18nContext } from "@app/i18n/i18n-react"
import { MapMarker, useBusinessMapMarkersQuery, useLatLngQuery } from "@app/graphql/generated"
import { updateMapLastCoords } from "@app/graphql/client-only-query"
import { check, PERMISSIONS, RESULTS } from "react-native-permissions"
import { gql, useApolloClient } from "@apollo/client"
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
  const client = useApolloClient()
  const { countryCode, loading } = useDeviceLocation()
  const { data: lastCoordsData, error: lastCoordsError } = useLatLngQuery()
  const { LL } = useI18nContext()

  const { data, error, refetch } = useBusinessMapMarkersQuery({
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  })

  const focusedMarkerRef = React.useRef<MapMarkerType | null>(null)
  const mostRecentCoords = React.useRef<Region>()

  const [userLocation, setUserLocation] = React.useState<Region>()
  const [isRefreshed, setIsRefreshed] = React.useState(false)
  const [focusedMarker, setFocusedMarker] = React.useState<MapMarker | null>(null)
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

  // On screen load, check (NOT request) if location permissions are given
  React.useEffect(() => {
    check(
      isIos
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    ).then((status) => {
      if (status === RESULTS.GRANTED) {
        getUserRegion(async (region) => {
          if (region) {
            setUserLocation(region)
          } else {
            setLocationDenied(true)
          }
        })
      } else {
        setLocationDenied(true)
      }
    })
  }, [isIos, setLocationDenied])

  React.useEffect(() => {
    if(lastCoordsError) {
      setLocationDenied(true)
      setUserLocation(EL_ZONTE_COORDS)
      alertOnLocationError()
    }
  }, [lastCoordsError])

  // save the last viewed location to be used as the initialLocation next time user uses app
  React.useEffect(() => {
    return () => {
      if (mostRecentCoords.current) {
        updateMapLastCoords(client, mostRecentCoords.current)
      }
    }
  }, [])

  // Flow when location permissions are denied
  React.useEffect(() => {
    if (countryCode && wasLocationDenied && lastCoordsData && !loading) {
      // User has used map before, so we use their last viewed coords
      if (lastCoordsData.lat && lastCoordsData.lng) {
        const region: Region = {
          latitude: lastCoordsData.lat,
          longitude: lastCoordsData.lng,
          latitudeDelta: 0.2,
          longitudeDelta: 0.2
        }
        setUserLocation(region)
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
          setUserLocation(region)
        } else {
          // backup if country code is not recognized
          setUserLocation(EL_ZONTE_COORDS)
        }
      }
    }
  }, [wasLocationDenied, countryCode, lastCoordsData, loading, setUserLocation])

  const handleCalloutPress = (item: MapMarker | null) => {
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

  const alertOnLocationError = () => {
    alert("Oops. Something went wrong while getting your location")
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
      {userLocation && (
        <MapComponent
          data={data}
          userLocation={userLocation}
          handleMapPress={handleMapPress}
          handleMarkerPress={handleMarkerPress}
          focusedMarker={focusedMarker}
          focusedMarkerRef={focusedMarkerRef}
          handleCalloutPress={handleCalloutPress}
          mostRecentCoordsRef={mostRecentCoords}
          onError={alertOnLocationError}
        />
      )}
    </Screen>
  )
}
