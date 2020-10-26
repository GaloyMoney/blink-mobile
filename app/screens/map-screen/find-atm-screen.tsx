import * as React from "react"
import { StyleSheet } from "react-native"
import { Screen } from "../../components/screen"
import MapView, { Marker } from "react-native-maps"
import { StoreContext } from "../../models"
import { observer } from "mobx-react"

const styles = StyleSheet.create({
  map: {
    height: "100%",
    width: "100%",
  },
})

export const MapScreen: React.FC = observer(({ }) => {
  const store = React.useContext(StoreContext)


  // React.useLayoutEffect(() => {
  //   navigation.setOptions(
  //     {
  //       title: route.params.title,
  //     },
  //     [],
  //   )
  // })

  const markers = []
  const entries = store.markers.forEach((item) => {
    markers.push(<Marker coordinate={item.coordinate} title={item.title} key={item.title} />)
  })

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
        {markers}
      </MapView>
    </Screen>
  )
})
