import Geolocation from '@react-native-community/geolocation'
import { useFocusEffect } from '@react-navigation/native'
import { observer } from "mobx-react"
import * as React from "react"
import { useCallback, useState } from "react"
import { StyleSheet } from "react-native"
import MapView, { Marker } from "react-native-maps"
import { Screen } from "../../components/screen"
import { StoreContext } from "../../models"


const styles = StyleSheet.create({
  map: {
    height: "100%",
    width: "100%",
  },
})

export const MapScreen: React.FC = observer(({ }) => {
  const store = React.useContext(StoreContext)

  const [currentLocation, setCurrentLocation] = useState(null)

  useFocusEffect(useCallback(() => {
    const watchId = Geolocation.watchPosition(info => {
      // console.tron.log(info)
      setCurrentLocation(<Marker 
        coordinate={{latitude: info.coords.latitude, longitude: info.coords.longitude}}
        title={"Current location"}
        key={"currentLocation"}
        pinColor="blue"
        />)
    })

    return () => {
      Geolocation.clearWatch(watchId);
    }
  }, []))

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
        {currentLocation}
      </MapView>
    </Screen>
  )
})
