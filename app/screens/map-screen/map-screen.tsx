import { useFocusEffect } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
import { useCallback } from "react"
// eslint-disable-next-line react-native/split-platform-components
import { ActivityIndicator, Dimensions, View } from "react-native"
import Geolocation from "@react-native-community/geolocation"
import MapView, {
  Callout,
  CalloutSubview,
  MapMarkerProps,
  Marker,
  Region,
} from "react-native-maps"
import { Screen } from "../../components/screen"
import { RootStackParamList } from "../../navigation/stack-param-lists"
import { isIos } from "../../utils/helper"
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
Geolocation.setRNConfiguration({
  skipPermissionRequests: false,
  authorizationLevel: "whenInUse",
  enableBackgroundLocationUpdates: false,
})

export const MapScreen: React.FC<Props> = ({ navigation }) => {
  const {
    theme: { colors, mode: themeMode },
  } = useTheme()
  const styles = useStyles()
  const isAuthed = useIsAuthed()
  const { countryCode, loading } = useDeviceLocation()

  const [isLoadingLocation, setIsLoadingLocation] = React.useState(true)
  const [userLocation, setUserLocation] = React.useState<Region>()
  const [isRefreshed, setIsRefreshed] = React.useState(false)
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

  const maps = data?.businessMapMarkers ?? []

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
      }
      setIsLoadingLocation(false)
    }
  }, [wasLocationDenied, countryCode, loading, setIsLoadingLocation, setUserLocation])

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

  // TODO this should be memoized for performance improvements. Use reduce() inside a useMemo() with some dependency array values
  // and/or a generator function that yields markers asynchronously???
  const markers: ReturnType<React.FC<MapMarkerProps>>[] = []
  maps.forEach((item) => {
    if (item) {
      const onPress = () => {
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

      markers.push(
        <Marker
          coordinate={item.mapInfo.coordinates}
          key={item.username}
          pinColor={colors._orange}
        >
          <Callout onPress={() => (Boolean(item.username) && !isIos ? onPress() : null)}>
            <View style={styles.customView}>
              <Text type="h1" style={styles.title}>
                {item.mapInfo.title}
              </Text>
              {Boolean(item.username) &&
                (isIos ? (
                  <CalloutSubview onPress={() => onPress()}>
                    <GaloyPrimaryButton
                      style={styles.ios}
                      title={LL.MapScreen.payBusiness()}
                    />
                  </CalloutSubview>
                ) : (
                  <GaloyPrimaryButton
                    containerStyle={styles.android}
                    title={LL.MapScreen.payBusiness()}
                  />
                ))}
            </View>
          </Callout>
        </Marker>,
      )
    }
  })

  return (
    <Screen>
      {isLoadingLocation ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <MapView
          style={styles.map}
          showsUserLocation={true}
          initialRegion={userLocation}
          customMapStyle={themeMode === "dark" ? MapStyles.dark : MapStyles.light}
        >
          {markers}
        </MapView>
      )}
    </Screen>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  android: { marginTop: 18 },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  customView: {
    alignItems: "center",
    margin: 12,
  },

  ios: { paddingTop: 12 },

  map: {
    height: "100%",
    width: "100%",
  },

  title: { color: colors._darkGrey },
}))
