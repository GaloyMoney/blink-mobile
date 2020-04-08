import * as React from "react"
import { StyleSheet } from "react-native"
import { Screen } from "../../components/screen"
import MapView, { Marker } from "react-native-maps"

const styles = StyleSheet.create({
  map: {
    height: "100%",
    width: "100%",
  },
})

export const FindATMScreen: React.FC = ({ route, navigation }) => {
  React.useLayoutEffect(() => {
    navigation.setOptions(
      {
        title: route.params.title,
      },
      [],
    )
  })

  const markers = [
    {
      title: "ATM AllPoint",
      coordinate: {
        latitude: 37.78825,
        longitude: -122.4324,
      },
    },
    {
      title: "ATM AllPoint 2",
      coordinate: {
        latitude: 37.79525,
        longitude: -122.432,
      },
    },
    {
      title: "ATM AllPoint 3",
      coordinate: {
        latitude: 37.78945,
        longitude: -122.4254,
      },
    },
    {
      title: "ATM AllPoint 4",
      coordinate: {
        latitude: 37.78445,
        longitude: -122.4354,
      },
    },
    {
      title: "ATM AllPoint 5",
      coordinate: {
        latitude: 37.78045,
        longitude: -122.4324,
      },
    },
  ]

  return (
    <Screen>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {markers.map((item) => (
          <Marker coordinate={item.coordinate} title={item.title} key={item.title} />
        ))}
      </MapView>
    </Screen>
  )
}
