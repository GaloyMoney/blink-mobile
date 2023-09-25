import { useFocusEffect } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
import { useCallback } from "react"
// eslint-disable-next-line react-native/split-platform-components
import { PermissionsAndroid, Text, View } from "react-native"
import { Button } from "@rneui/base"
import MapView, {
  Callout,
  CalloutSubview,
  MapMarkerProps,
  Marker,
} from "react-native-maps"
import { Screen } from "../../components/screen"
import { RootStackParamList } from "../../navigation/stack-param-lists"
import { isIos } from "../../utils/helper"
import { toastShow } from "../../utils/toast"
import { useI18nContext } from "@app/i18n/i18n-react"
import crashlytics from "@react-native-firebase/crashlytics"
import { useBusinessMapMarkersQuery } from "@app/graphql/generated"
import { gql } from "@apollo/client"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { makeStyles, useTheme } from "@rneui/themed"

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
    theme: { colors },
  } = useTheme()
  const styles = useStyles()
  const isAuthed = useIsAuthed()

  const [isRefreshed, setIsRefreshed] = React.useState(false)
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
  maps.forEach((item) => {
    if (item) {
      const onPress = () => {
        if (isAuthed && item?.username) {
          navigation.navigate("sendBitcoinDestination", { username: item.username })
        } else {
          navigation.navigate("phoneFlow")
        }
      }

      markers.push(
        <Marker
          coordinate={item.mapInfo.coordinates}
          key={item.username}
          pinColor={colors._orange}
        >
          <Callout
            // alphaHitTest
            // tooltip
            onPress={() => (Boolean(item.username) && !isIos ? onPress() : null)}
          >
            <View style={styles.customView}>
              <Text style={styles.title}>{item.mapInfo.title}</Text>
              {Boolean(item.username) && !isIos && (
                <Button
                  containerStyle={styles.android}
                  title={LL.MapScreen.payBusiness()}
                />
              )}
              {isIos && (
                <CalloutSubview onPress={() => (item.username ? onPress() : null)}>
                  {Boolean(item.username) && (
                    <Button style={styles.ios} title={LL.MapScreen.payBusiness()} />
                  )}
                </CalloutSubview>
              )}
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
          latitude: 13.496743,
          longitude: -89.439462,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {markers}
      </MapView>
    </Screen>
  )
}
