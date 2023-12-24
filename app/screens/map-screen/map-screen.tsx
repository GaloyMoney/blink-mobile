import { useFocusEffect } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
import { useCallback } from "react"
// eslint-disable-next-line react-native/split-platform-components
import { Dimensions } from "react-native"
import Animated, { useSharedValue, withSpring, withTiming } from "react-native-reanimated"
import Geolocation from "@react-native-community/geolocation"
import { Region } from "react-native-maps"
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
import { Text, makeStyles } from "@rneui/themed"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"

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
// const BOUNDING_BOX_HEIGHT = 5 // 1 latitude = 69 miles
// const BOUNDING_BOX_WIDTH = 6 // 1 longitude = 54.6 miles

const PAY_CONTAINER_HEIGHT = 106

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
  const styles = useStyles()
  const heightAnim = useSharedValue(-PAY_CONTAINER_HEIGHT)
  const { LL } = useI18nContext()
  const { data, error, refetch } = useBusinessMapMarkersQuery({
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  })

  const [userLocation, setUserLocation] = React.useState<Region>()
  const [isRefreshed, setIsRefreshed] = React.useState(false)
  const [focusedMarker, setFocusedMarker] = React.useState<MarkerData | null>(null)
  // const [boundingBox, setBoundingBox] = React.useState<BoundingBox>()
  const [wasLocationDenied, setLocationDenied] = React.useState(false)
  const [mapBottomPadding, setMapBottomPadding] = React.useState(0)


  useFocusEffect(() => {
    if (!isRefreshed) {
      setIsRefreshed(true)
      refetch()
    }
  })

  if (error) {
    toastShow({ message: error.message, LL })
  }

  // -------- might use this later if it's decided to only load a portion of the map markers at a time ----------- //
  // React.useEffect(() => {
  //   if (userLocation) {
  //     calculateBoundingBox(userLocation)
  //   }
  // }, [userLocation])

  // if getting location was denied and device's country code has been found (or defaulted)
  // this is used to finalize the initial location shown on the Map
  React.useEffect(() => {
    if (countryCode && wasLocationDenied && !loading) {
      // El Salvador gets special treatment here and zones in on El Zonte
      if (countryCode === "SV") {
        setUserLocation(EL_ZONTE_COORDS)
      } else {
        // JSON 'hashmap' with every country code paired with its lat and lng
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
          // country code wasn't identified so resort to El Zonte
        } else {
          setUserLocation(EL_ZONTE_COORDS)
        }
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

  const heightAnimate = (toValue: number, duration: number) => {
    heightAnim.value = withTiming(toValue)
  }

  const handleMarkerPress = (item: MarkerData) => {
    if (!focusedMarker) {
      heightAnimate(0, 500)
      setTimeout(() => {
        setMapBottomPadding(PAY_CONTAINER_HEIGHT)
      }, 500)
    }
    setFocusedMarker(item)
  }

  const handleMapPress = () => {
    if (focusedMarker) {
      setMapBottomPadding(0)
      heightAnimate(-PAY_CONTAINER_HEIGHT, 300)
    }
    setFocusedMarker(null)
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

  useFocusEffect(requestLocationPermission)

  // -------- might use this later if it's decided to only load a portion of the map markers at a time ----------- //
  // const calculateBoundingBox = async (region: Region) => {
  //   let _boundingBox: BoundingBox
  //   if (mapViewRef.current) {
  //     let { northEast, southWest } = await mapViewRef.current?.getMapBoundaries()
  //     // TODO adjust to be height BOUNDING_BOX_HEIGHT and width BOUNDING_BOX_WIDTH
  //     // and dont forget to account for how some of the values are positive and some negative
  //     _boundingBox = { northEast, southWest }
  //   } else {
  //     // this shouldn't happen but if mapViewRef.current is null for whatever reason, we have a backup
  //     _boundingBox = {
  //       northEast: {
  //         latitude: region.latitude + Math.round(BOUNDING_BOX_HEIGHT / 2),
  //         longitude: region.longitude + Math.round(BOUNDING_BOX_WIDTH / 2),
  //       },
  //       southWest: {
  //         latitude: region.latitude - Math.round(BOUNDING_BOX_HEIGHT / 2),
  //         longitude: region.longitude - Math.round(BOUNDING_BOX_WIDTH / 2),
  //       },
  //     }
  //   }
  //   setBoundingBox(_boundingBox)
  // }

  return (
    <Screen>
      {userLocation && (
        <>
          <MapInterface
            data={data}
            userLocation={userLocation}
            handleMapPress={handleMapPress}
            handleMarkerPress={handleMarkerPress}
            handleCalloutPress={handleCalloutPress}
            bottomPadding={mapBottomPadding}
          />
          <Animated.View style={[styles.payContainer, { bottom: heightAnim }]}>
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.payCompany}>
              {focusedMarker?.mapInfo?.title}
            </Text>
            <GaloyPrimaryButton
              title={LL.MapScreen.payBusiness()}
              onPress={() => handleCalloutPress(focusedMarker)}
            />
          </Animated.View>
        </>
      )}
    </Screen>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  payContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -PAY_CONTAINER_HEIGHT,
    width: "100%",
    backgroundColor: "white",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 10,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.grey4,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  payCompany: {
    fontSize: 26,
    marginBottom: 10,
  },
}))
