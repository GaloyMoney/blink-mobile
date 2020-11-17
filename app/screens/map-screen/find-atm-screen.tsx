import Geolocation from '@react-native-community/geolocation'
import { useFocusEffect } from '@react-navigation/native'
import { observer } from "mobx-react"
import * as React from "react"
import { useCallback, useState } from "react"
import { Alert, PermissionsAndroid, StyleSheet, View } from "react-native"
import MapView, { Callout, CalloutSubview, Marker } from "react-native-maps"
import { Text } from "react-native"
import { Screen } from "../../components/screen"
import { StoreContext } from "../../models"
import { isIos } from "../../utils/helper"
import { Button } from "react-native-elements"


const styles = StyleSheet.create({
  map: {
    height: "100%",
    width: "100%",
  },

  customView: {
    margin: 12,
    alignItems: 'center',
    // width: 140,
    // height: 140,
  },

})

export const MapScreen: React.FC = observer(({ navigation }) => {
  const store = React.useContext(StoreContext)

  const [currentLocation, setCurrentLocation] = useState(null)
  const [grantedPermission, setGrantedPermission] = useState(isIos ? true: false)

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Locate yourself on the map",
          message:
            "Activate your location so you know where you are on the map",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        setGrantedPermission(true)
        console.tron.log("You can use the location");
      } else {
        console.tron.log("Location permission denied");
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
      <Marker coordinate={item.coordinate} key={item.title} 
          //  title={item.title}
        >
        <Callout
          // alphaHitTest
          // tooltip
            onPress={() => !!item.username && !isIos ? navigation.navigate("sendBitcoin", {username: item.username}) : null}  
          >
            <View             style={styles.customView}>
              <Text style={{fontSize: 18}}>{item.title}</Text>
              {!!item.username && !isIos && <Button 
                containerStyle={{marginTop: 18}}
                title={"pay this business"}
                // onPress={() => navigation.navigate("sendBitcoin", {username: item.username})}  
              />}
              { isIos &&
              <CalloutSubview
                onPress={() => !!item.username ? navigation.navigate("sendBitcoin", {username: item.username}) : null}  
              >
              { !!item.username && <Button 
                style={{paddingTop: 12}}
                title={"pay this business"}
                // onPress={() => navigation.navigate("sendBitcoin", {username: item.username})}  
              />}
              </CalloutSubview>
              }
            </View>
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
