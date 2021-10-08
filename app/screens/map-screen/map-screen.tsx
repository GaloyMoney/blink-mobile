import { gql, useApolloClient, useQuery } from "@apollo/client"
import { useFocusEffect } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
import { useCallback } from "react"
// eslint-disable-next-line react-native/split-platform-components
import { PermissionsAndroid, StyleSheet, Text, View } from "react-native"
import { Button } from "react-native-elements"
import MapView, { Callout, CalloutSubview, Marker } from "react-native-maps"
import { Screen } from "../../components/screen"
import { walletIsActive } from "../../graphql/query"
import { PrimaryStackParamList } from "../../navigation/stack-param-lists"
import { ScreenType } from "../../types/jsx"
import { isIos } from "../../utils/helper"
import { translate } from "../../i18n"
import { palette } from "../../theme/palette"
import { toastShow } from "../../utils/toast"

const QUERY_BUSINESSES = gql`
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

const styles = StyleSheet.create({
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

  title: { fontSize: 18 },
})

type Props = {
  navigation: StackNavigationProp<PrimaryStackParamList, "Map">
}

export const MapScreen: ScreenType = ({ navigation }: Props) => {
  const [isRefreshed, setIsRefreshed] = React.useState(false)
  const client = useApolloClient()
  const { data, error, refetch } = useQuery(QUERY_BUSINESSES, {
    notifyOnNetworkStatusChange: true,
  })

  useFocusEffect(() => {
    if (!isRefreshed) {
      setIsRefreshed(true)
      refetch()
    }
  })

  if (error) {
    toastShow(error.message)
  }

  const maps = data?.businessMapMarkers ?? []

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: translate("MapScreen.locationPermissionTitle"),
          message: translate("MapScreen.locationPermissionMessage"),
          buttonNeutral: translate("MapScreen.locationPermissionNeutral"),
          buttonNegative: translate("MapScreen.locationPermissionNegative"),
          buttonPositive: translate("MapScreen.locationPermissionPositive"),
        },
      )
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("You can use the location")
      } else {
        console.log("Location permission denied")
      }
    } catch (err) {
      console.warn(err)
    }
  }

  useFocusEffect(
    useCallback(() => {
      requestLocationPermission()
    }, []),
  )

  // React.useLayoutEffect(() => {
  //   navigation.setOptions(
  //     {
  //       title: route.params.title,
  //     },
  //     [],
  //   )
  // })

  const markers: JSX.Element[] = []
  maps.forEach((item) => {
    const onPress = () =>
      walletIsActive(client)
        ? navigation.navigate("sendBitcoin", { username: item.username })
        : navigation.navigate("phoneValidation")
    markers.push(
      <Marker
        coordinate={item.mapInfo.coordinates}
        key={item.title}
        pinColor={palette.orange}
      >
        <Callout
          // alphaHitTest
          // tooltip
          onPress={() => (!!item.username && !isIos ? onPress() : null)}
        >
          <View style={styles.customView}>
            <Text style={styles.title}>{item.mapInfo.title}</Text>
            {!!item.username && !isIos && (
              <Button
                containerStyle={styles.android}
                title={translate("MapScreen.payBusiness")}
              />
            )}
            {isIos && (
              <CalloutSubview onPress={() => (item.username ? onPress() : null)}>
                {!!item.username && (
                  <Button style={styles.ios} title={translate("MapScreen.payBusiness")} />
                )}
              </CalloutSubview>
            )}
          </View>
        </Callout>
      </Marker>,
    )
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
