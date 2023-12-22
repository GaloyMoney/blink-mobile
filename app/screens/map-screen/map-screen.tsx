import { useFocusEffect } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
import { useCallback } from "react"
// eslint-disable-next-line react-native/split-platform-components
import { ActivityIndicator, Dimensions, View } from "react-native"
import Geolocation from "@react-native-community/geolocation"
import MapView, {
  BoundingBox,
  Callout,
  CalloutSubview,
  MapMarkerProps,
  Marker,
  Region,
} from "react-native-maps"
import { Screen } from "../../components/screen"
import { RootStackParamList } from "../../navigation/stack-param-lists"
import { toastShow } from "../../utils/toast"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useBusinessMapMarkersQuery } from "@app/graphql/generated"
import { gql } from "@apollo/client"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { Text, makeStyles, useTheme } from "@rneui/themed"
import { PhoneLoginInitiateType } from "../phone-auth-screen"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"
import MapStyles from "./map-styles.json"

import countryCodes from "../../../utils/countryInfo.json"
import { CountryCode } from "libphonenumber-js/mobile"
import useDeviceLocation from "@app/hooks/use-device-location"
import MapMarker from "@app/components/map-marker"

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

// the size of the box that will encompass viewable markers on the map
const BOUNDING_BOX_HEIGHT = 5 // 1 latitude = 69 miles
const BOUNDING_BOX_WIDTH = 6 // 1 longitude = 54.6 miles

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "Primary">
}

// TODO am I doing this stupid? maybe theres a graphQL type declared somewhere else I can use
export type MarkerData = {
  readonly __typename: "MapMarker"
  readonly username?: string | null | undefined
  readonly mapInfo: {
    readonly __typename: "MapInfo"
    readonly title: string
    readonly coordinates: {
      readonly __typename: "Coordinates"
      readonly longitude: number
      readonly latitude: number
    }
  }
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
  const {
    theme: { colors, mode: themeMode },
  } = useTheme()
  const styles = useStyles()
  const isAuthed = useIsAuthed()
  const { countryCode, loading } = useDeviceLocation()

  const mapViewRef = React.useRef<MapView>(null)

  const [isLoadingLocation, setIsLoadingLocation] = React.useState(true)
  const [userLocation, setUserLocation] = React.useState<Region>()
  const [isRefreshed, setIsRefreshed] = React.useState(false)
  const [markers, setMarkers] = React.useState<React.ReactElement[]>([])
  const [wasLocationDenied, setLocationDenied] = React.useState(false)
  const { data, error, refetch } = useBusinessMapMarkersQuery({
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  })
  const { LL } = useI18nContext()

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
      // El Salvador gets special treatment here and zones in on El Zonte
      if (countryCode === "SV") {
        setUserLocation(EL_ZONTE_COORDS)
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
        }
      }
      setIsLoadingLocation(false)
    }
  }, [wasLocationDenied, countryCode, loading, setIsLoadingLocation, setUserLocation])

  /*
    whenever user location is set (will always be set at least with defaults)
    update the map markers
  */
  React.useEffect(() => {
    if (userLocation) {
      setViewableMarkers(userLocation)
    }
  }, [userLocation])

  const handleMarkerPress = (item: MarkerData) => {
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

  const handleRegionChangeComplete = (region: Region) => {
    console.log("this might call infinitely. watch out and check docs to fix if needed")
    setViewableMarkers(region)
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
          setIsLoadingLocation(false)
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

  useFocusEffect(requestLocationPermission)

  const calculateBoundingBox = async (region: Region): Promise<BoundingBox> => {
    let boundingBox: BoundingBox
    if (mapViewRef.current) {
      let { northEast, southWest } = await mapViewRef.current?.getMapBoundaries()
      // TODO adjust to be height BOUNDING_BOX_HEIGHT and width BOUNDING_BOX_WIDTH
      // and dont forget to account for how some of the values are positive and some negative
      boundingBox = { northEast, southWest }
    } else {
      // this shouldn't happen but technically React refs start out as null so this is here
      // in case the ref hasn't been set on the MapView yet
      boundingBox = {
        northEast: {
          latitude: region.latitude + Math.round(BOUNDING_BOX_HEIGHT / 2),
          longitude: region.longitude + Math.round(BOUNDING_BOX_WIDTH / 2),
        },
        southWest: {
          latitude: region.latitude - Math.round(BOUNDING_BOX_HEIGHT / 2),
          longitude: region.longitude - Math.round(BOUNDING_BOX_WIDTH / 2),
        },
      }
    }
    return boundingBox
  }

  const setViewableMarkers = async (region: Region) => {
    const boundingBox = await calculateBoundingBox(region)

    // TODO iterating through the whole world's markers (currently 650+) is wild
    // need some sort of cool sorting alogorithm based of lat and lng values to deal with this
    const markers = (data?.businessMapMarkers ?? []).reduce(
      (arr: React.ReactElement[], item: MarkerData | null) => {
        if (item) {
          const { latitude, longitude } = item.mapInfo.coordinates
          const isInView: boolean =
            latitude < boundingBox.northEast.latitude &&
            latitude > boundingBox.southWest.latitude &&
            longitude > boundingBox.southWest.longitude &&
            longitude < boundingBox.northEast.longitude
          if (isInView) {
            const marker = <MapMarker onPress={handleMarkerPress} item={item} />
            arr.push(marker)
          }
        }

        return arr
      },
      [] as React.ReactElement[],
    )
    setMarkers(markers)
  }

  return (
    <Screen>
      {isLoadingLocation ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <MapView
          ref={mapViewRef}
          style={styles.map}
          showsUserLocation={true}
          onRegionChangeComplete={handleRegionChangeComplete}
          loadingEnabled
          initialRegion={userLocation}
          customMapStyle={themeMode === "dark" ? MapStyles.dark : MapStyles.light}
        >
          {markers}
        </MapView>
      )}
    </Screen>
  )
}

const useStyles = makeStyles(() => ({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    height: "100%",
    width: "100%",
  },
}))
