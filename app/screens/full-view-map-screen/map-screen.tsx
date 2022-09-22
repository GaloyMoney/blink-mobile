import * as React from "react"
import { useState } from "react"
// eslint-disable-next-line react-native/split-platform-components
import { Dimensions, SafeAreaView, StyleSheet, Text, View } from "react-native"
import { palette } from "@app/theme"
import { MarketPlaceParamList } from "@app/navigation/stack-param-lists"
import { StackNavigationProp } from "@react-navigation/stack"
import MapView, { Callout, Marker } from "react-native-maps"
import Geolocation from "@react-native-community/geolocation"
import { HeaderComponent } from "@app/components/header"
import { useDispatch, useSelector } from "react-redux"
import { setTempStore } from "@app/redux/reducers/store-reducer"
import { getLocation } from "@app/utils/helper"
import { RootState } from "@app/redux"
const { width, height } = Dimensions.get("window")
const IMAGE_WIDTH = width - 30 * 2
const IMAGE_HEIGHT = IMAGE_WIDTH * 0.61
interface Props {
  navigation: StackNavigationProp<MarketPlaceParamList>
}
export const MapScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch()

  const location = useSelector(
    (state: RootState) => state.storeReducer?.tempStore?.location,
  )
  const [position, setPosition] = useState({
    latitude: 10,
    longitude: 10,
    latitudeDelta: 0.001,
    longitudeDelta: 0.001,
  })

  React.useEffect(() => {
    Geolocation.getCurrentPosition(
      (pos) => {
        const crd = pos.coords
        console.log("pos: ", pos)

        dispatch(
          setTempStore({
            location: {
              lat: crd.latitude,
              long: crd.longitude,
            },
          }),
        )
        setPosition({
          latitude: crd.latitude,
          longitude: crd.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        })
      },
      (err) => {
        console.log("err: ", err)
      },
    )
  }, [])
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <MapView
        style={styles.map}
        region={position}
        showsCompass={true}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={true}
        rotateEnabled={true}
      >
        <Marker
          title="Yor are here"
          coordinate={position}
          draggable={true}
          onDragEnd={({ nativeEvent: { coordinate } }) => {
            dispatch(
              setTempStore({
                location: {
                  lat: coordinate.latitude,
                  long: coordinate.longitude,
                },
              }),
            )
            setPosition({
              latitude: coordinate.latitude,
              longitude: coordinate.longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            })
          }}
        ></Marker>
      </MapView>

      <HeaderComponent style={{ paddingHorizontal: 20 }} />
      <Text
        style={{
          width: "100%",
          paddingHorizontal: 30,
          backgroundColor: "white",
          opacity: 0.7,
          textAlign: "center",
        }}
        numberOfLines={2}
      >
        {getLocation(location)}
      </Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
})
