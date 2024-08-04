/* eslint-disable @typescript-eslint/no-explicit-any */
import { useBusinessMapMarkersQuery } from "@app/graphql/generated"
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  gql,
  useQuery,
} from "@apollo/client"
import { useFocusEffect } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
import { useCallback } from "react"
// eslint-disable-next-line react-native/split-platform-components
import { PermissionsAndroid, Text, View } from "react-native"
import { Button } from "@rneui/base"
import MapView, {
  Marker,
  Callout,
  // CalloutSubview,
  MapMarkerProps,
} from "react-native-maps"
import { Screen } from "../../components/screen"
import { RootStackParamList } from "../../navigation/stack-param-lists"
import { isIos } from "../../utils/helper"
import { toastShow } from "../../utils/toast"
import { useI18nContext } from "@app/i18n/i18n-react"
import crashlytics from "@react-native-firebase/crashlytics"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { makeStyles, useTheme } from "@rneui/themed"

const httpLink = createHttpLink({
  uri: "https://api.blink.sv/graphql",
  // Add any required headers here
})

const blinkClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
})

const useStyles = makeStyles(({ colors }) => ({
  android: { marginTop: 18 },

  customView: {
    alignItems: "center",
    margin: 12,
  },

  ios: { paddingTop: 12 },

  map: {
    height: "100%",
    width: "100%",
  },

  title: { color: colors._darkGrey, fontSize: 18 },
}))

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "Primary">
}

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

export const MapScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme().theme
  const styles = useStyles()
  const isAuthed = useIsAuthed()
  const { LL } = useI18nContext()

  const { data: blinkData, error: blinkError } = useQuery(BUSINESS_MAP_MARKERS_QUERY, {
    client: blinkClient, // Use the custom Apollo client
    fetchPolicy: "cache-and-network",
  })

  // Query using generated hook
  const {
    data: flashData,
    error: flashError,
    refetch,
  } = useBusinessMapMarkersQuery({
    fetchPolicy: "cache-and-network",
  })

  useFocusEffect(
    useCallback(() => {
      refetch()
    }, [refetch]),
  )

  // Handle errors from both queries
  if (blinkError || flashError) {
    const errorMessage = blinkError?.message || flashError?.message
    if (errorMessage) {
      toastShow({ message: errorMessage })
    }
  }

  // Merge data from both queries
  const maps = [
    ...(blinkData?.businessMapMarkers?.map((item: any) => ({
      ...item,
      source: "blink",
    })) ?? []),
    ...(flashData?.businessMapMarkers?.map((item: any) => ({
      ...item,
      source: "flash",
    })) ?? []),
  ]

  const requestLocationPermission = useCallback(() => {
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
    // disable eslint because we don't want to re-run this function when the language changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useFocusEffect(requestLocationPermission)

  const markers: ReturnType<React.FC<MapMarkerProps>>[] = []
  maps.forEach((item: any, index) => {
    if (item) {
      const key = item.username + item.mapInfo.title + index
      const onPress = () => {
        const domain = item.source === "blink" ? "@blink.sv" : "@flashapp.me"
        const usernameWithDomain = `${item.username}${domain}`
        if (isAuthed && item?.username) {
          navigation.navigate("sendBitcoinDestination", { username: usernameWithDomain })
        } else {
          navigation.navigate("phoneFlow")
        }
      }

      markers.push(
        <Marker coordinate={item.mapInfo.coordinates} key={key} pinColor={colors._orange}>
          <Callout
            // alphaHitTest
            // tooltip
            onPress={() => (Boolean(item.username) && !isIos ? onPress() : null)}
          >
            <View style={styles.customView}>
              <Text style={styles.title}>{item.mapInfo.title}</Text>
              <Button
                containerStyle={isIos ? styles.ios : styles.android}
                title={LL.MapScreen.payBusiness()}
                onPress={onPress}
              />
            </View>
          </Callout>
        </Marker>,
      )
    }
  })

  return (
    <Screen>
      <MapView
        style={styles.map}
        showsUserLocation={true}
        initialRegion={{
          latitude: 18.1085,
          longitude: -69.42021,
          latitudeDelta: 18.0,
          longitudeDelta: 18.0,
        }}
      >
        {markers}
      </MapView>
    </Screen>
  )
}
