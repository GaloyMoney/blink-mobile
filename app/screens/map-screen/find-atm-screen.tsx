import Geolocation from '@react-native-community/geolocation'
import { useFocusEffect } from '@react-navigation/native'
import { observer } from "mobx-react"
import * as React from "react"
import { useCallback, useState } from "react"
import { PermissionsAndroid, StyleSheet } from "react-native"
import MapView, { Marker } from "react-native-maps"
import { Screen } from "../../components/screen"
import { StoreContext } from "../../models"
import { isIos } from "../../utils/helper"


const styles = StyleSheet.create({
  map: {
    height: "100%",
    width: "100%",
  },
})

export const MapScreen: React.FC = observer(({ }) => {
  const store = React.useContext(StoreContext)

  const [currentLocation, setCurrentLocation] = useState(null)
  const [grantedPermission, setGrantedPermission] = useState(isIos ? true: false)

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Cool Photo App Camera Permission",
          message:
            "Cool Photo App needs access to your camera " +
            "so you can take awesome pictures.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        setGrantedPermission(true)
        console.tron.log("You can use the camera");
      } else {
        console.tron.log("Camera permission denied");
      }
    } catch (err) {
      console.tron.warn(err);
    }
  };
  

  useFocusEffect(useCallback(() => {
    requestCameraPermission()

    if (!grantedPermission) {
      return
    }

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
  }, [grantedPermission]))

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
