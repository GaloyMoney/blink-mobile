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

export const MapScreen: React.FC = ({ }) => {
  // React.useLayoutEffect(() => {
  //   navigation.setOptions(
  //     {
  //       title: route.params.title,
  //     },
  //     [],
  //   )
  // })

  const markers = [
    {
      title: "Bitcoin ATM - Café Cocoa",
      coordinate: {
        latitude: 13.496743,
        longitude: -89.439462,
      },
    },
  ]

  return (
    <Screen>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 13.496743,
          longitude: -89.439462,
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
