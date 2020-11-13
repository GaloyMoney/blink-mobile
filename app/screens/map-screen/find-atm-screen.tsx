import Geolocation from '@react-native-community/geolocation'
import { useFocusEffect } from '@react-navigation/native'
import { observer } from "mobx-react"
import * as React from "react"
import { useCallback, useState } from "react"
import { Alert, PermissionsAndroid, StyleSheet } from "react-native"
import MapView, { Callout, CalloutSubview, Marker } from "react-native-maps"
import { Text } from "react-native"
import { Screen } from "../../components/screen"
import { StoreContext } from "../../models"
import { isIos } from "../../utils/helper"


const styles = StyleSheet.create({
  map: {
    height: "100%",
    width: "100%",
  },

  customView: {
    width: 140,
    height: 140,
  },

  calloutButton: {
    width: 'auto',
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 10,
  },
})

export const MapScreen: React.FC = observer(({ }) => {
  const store = React.useContext(StoreContext)

  const [currentLocation, setCurrentLocation] = useState(null)
  const [grantedPermission, setGrantedPermission] = useState(isIos ? true: false)

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Where are you on the map?",
          message:
            "Activate your location so you know where you are on the map",
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
    requestLocationPermission()

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
    markers.push(
      <Marker coordinate={item.coordinate} key={item.title} >
        <Callout
          // alphaHitTest
          // tooltip
          onPress={() => {
            // if (
            //   e.nativeEvent.action === 'marker-inside-overlay-press' ||
            //   e.nativeEvent.action === 'callout-inside-press'
            // ) {
            //   return;
            // }

            Alert.alert('callout pressed main');
          }}
           style={styles.customView}
          >
          <CalloutSubview
            onPress={() => {
              Alert.alert('callout pressed subview');
            }}
            // style={[styles.calloutButton]}
          >
            <Text>{item.title}</Text>
            <Text>{`This is a custom callout bubble view`}</Text>
          </CalloutSubview>
        </Callout>
      </Marker>
    )
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
