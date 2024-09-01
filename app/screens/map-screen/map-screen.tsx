/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/split-platform-components */
/* eslint-disable no-extra-boolean-cast */
/* eslint-disable no-implicit-coercion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */
import React, { memo, useCallback, useEffect, useState } from "react"
import { PermissionsAndroid, Platform } from "react-native"
import MapView from "react-native-maps"
import { makeStyles } from "@rneui/themed"
import crashlytics from "@react-native-firebase/crashlytics"
import { useI18nContext } from "@app/i18n/i18n-react"

// components
import { Screen } from "../../components/screen"
import {
  AddButton,
  AddPin,
  CustomMarker,
  MerchantSuggestModal,
  RefreshButton,
} from "@app/components/map-screen"

// utils
import { toastShow } from "../../utils/toast"

// hooks
import { useActivityIndicator } from "@app/hooks"

// gql
import {
  useBusinessMapMarkersQuery,
  useMerchantMapSuggestMutation,
  useSettingsScreenQuery,
} from "@app/graphql/generated"
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  gql,
  useQuery,
} from "@apollo/client"

const httpLink = createHttpLink({
  uri: "https://api.blink.sv/graphql",
  // Add any required headers here
})

const blinkClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
})

const BUSINESS_MAP_MARKERS_QUERY = gql`
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

export const MapScreen = memo(() => {
  const { toggleActivityIndicator } = useActivityIndicator()
  const styles = useStyles()
  const { LL } = useI18nContext()
  const { data } = useSettingsScreenQuery({ fetchPolicy: "cache-first" })
  const usernameTitle = data?.me?.username || LL.common.flashUser()

  const [businessName, setBusinessName] = useState("")
  const [isAddingPin, setIsAddingPin] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number
    longitude: number
  }>()

  const [merchantMapSuggest] = useMerchantMapSuggestMutation()
  const {
    data: blinkData,
    error: blinkError,
    loading: blinkLoading,
  } = useQuery(BUSINESS_MAP_MARKERS_QUERY, {
    client: blinkClient, // Use the custom Apollo client
    fetchPolicy: "cache-only",
  })
  const {
    data: flashData,
    error: flashError,
    refetch,
    loading: flashLoading,
  } = useBusinessMapMarkersQuery({
    fetchPolicy: "cache-first",
  })

  useEffect(() => {
    const errorMessage = blinkError?.message || flashError?.message
    if (!!errorMessage) {
      toastShow({ message: errorMessage, type: "error" })
    }
  }, [blinkError, flashError])

  useEffect(() => {
    if (blinkLoading || flashLoading) {
      toggleActivityIndicator(true)
    } else {
      toggleActivityIndicator(false)
    }
  }, [blinkLoading, flashLoading])

  useEffect(() => {
    requestLocationPermission()
  }, [])

  const requestLocationPermission = useCallback(() => {
    if (Platform.OS === "android") {
      const asyncRequestLocationPermission = async () => {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: LL.MapScreen.locationPermissionTitle(),
              message: LL.MapScreen.locationPermissionMessage(),
              buttonNeutral: LL.MapScreen.locationPermissionNeutral(),
              buttonNegative: LL.MapScreen.locationPermissionNegative(),
              buttonPositive: LL.MapScreen.locationPermissionPositive(),
            },
          )
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.debug("You can use the location")
          } else {
            console.debug("Location permission denied")
          }
        } catch (err: unknown) {
          if (err instanceof Error) {
            crashlytics().recordError(err)
          }
          console.debug(err)
        }
      }
      asyncRequestLocationPermission()
    }
  }, [])

  const handleMapPress = (event: any) => {
    if (isAddingPin) {
      const { latitude, longitude } = event.nativeEvent.coordinate
      setSelectedLocation({ latitude, longitude })
      setModalVisible(true)
      setIsAddingPin(false)
    }
  }

  const handleSubmit = () => {
    if (selectedLocation && businessName && usernameTitle) {
      setModalVisible(false)
      toggleActivityIndicator(true)
      const { latitude, longitude } = selectedLocation
      merchantMapSuggest({
        variables: {
          input: {
            latitude,
            longitude,
            title: businessName,
            username: usernameTitle,
          },
        },
      })
        .then(() => {
          toastShow({ message: "Pin added successfully!", type: "success" })
          refetch()
        })
        .catch((error: any) => {
          toastShow({ message: "Error adding pin: " + error.message })
        })
        .finally(() => {
          toggleActivityIndicator(false)
        })
    }
  }

  return (
    <Screen style={styles.center}>
      <MapView
        style={styles.map}
        showsUserLocation={true}
        onPress={handleMapPress} // Add onPress event
        initialRegion={{
          latitude: 18.018,
          longitude: -77.329,
          latitudeDelta: 2.1,
          longitudeDelta: 2.1,
        }}
      >
        <CustomMarker blinkData={blinkData} flashData={flashData} />
      </MapView>
      {!isAddingPin && <RefreshButton onRefresh={() => refetch()} />}
      <AddPin visible={isAddingPin} />
      <AddButton handleOnPress={setIsAddingPin} />
      <MerchantSuggestModal
        isVisible={modalVisible}
        setIsVisible={setModalVisible}
        businessName={businessName}
        setBusinessName={setBusinessName}
        onSubmit={handleSubmit}
        selectedLocation={selectedLocation}
      />
    </Screen>
  )
})

const useStyles = makeStyles(() => ({
  map: {
    height: "100%",
    width: "100%",
  },
  center: {
    alignItems: "center",
  },
}))
