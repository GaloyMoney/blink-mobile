import * as React from "react"
import { useState } from "react"
// eslint-disable-next-line react-native/split-platform-components
import {
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { Screen } from "../../components/screen"
import { fontSize, palette, typography } from "@app/theme"
import { HeaderComponent } from "@app/components/header"
import { images } from "@app/assets/images"
import { eng } from "@app/constants/en"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@app/redux"
import ImagePicker from "react-native-image-crop-picker"
import { FooterCreatePost } from "./footer"
import { MarketPlaceParamList } from "@app/navigation/stack-param-lists"
import { StackNavigationProp } from "@react-navigation/stack"
import { setTempStore } from "@app/redux/reducers/store-reducer"
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps"
import Geolocation from "@react-native-community/geolocation"
import CurrentLocation from "@asset/svgs/current-location.svg"
import { Row } from "@app/components/row"
import { AndroidBottomSpace } from "./android-bottom-spacing"
const { width, height } = Dimensions.get("window")
const IMAGE_WIDTH = width - 30 * 2
const IMAGE_HEIGHT = IMAGE_WIDTH * 0.61
interface Props {
  navigation: StackNavigationProp<MarketPlaceParamList>
}
export const AddLocationScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch()
  const name = useSelector((state: RootState) => state.storeReducer?.tempStore?.name)
  const tempPost = useSelector((state: RootState) => state.storeReducer?.tempStore)
  const location = useSelector(
    (state: RootState) => state.storeReducer?.tempStore?.location,
  )
  const thumbnail = useSelector(
    (state: RootState) => state.storeReducer?.tempStore?.mainImageUrl,
  )

  const [position, setPosition] = useState({
    latitude: 10,
    longitude: 10,
    latitudeDelta: 0.001,
    longitudeDelta: 0.001,
  })
  const getLocation = () => {
    if (!location || !location?.lat || !location?.long) return ""
    return `Lat: ${location.lat}, Long: ${location.long}`
  }
  React.useEffect(() => {
    Geolocation.getCurrentPosition(
      (pos) => {
        const crd = pos.coords
        dispatch(
          setTempStore({
            ...tempPost,
            location: {
              lat: crd.latitude,
              long: crd.longitude,
              // lat: 9.9227376,
              // long: -84.0748629,
            },
          }),
        )
        setPosition({
          latitude: crd.latitude,
          longitude: crd.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,

          // latitude: 9.9227376,
          // longitude: -84.0748629,
          // latitudeDelta: 0.001,
          // longitudeDelta: 0.001,
        })
      },
      (err) => {
        console.log("err: ", err)
      },
    )
  }, [])
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <Screen style={styles.container}>
        <HeaderComponent style={{ paddingHorizontal: 20 }} />
        <View style={{ flex: 1, paddingHorizontal: 30, width: "100%" }}>
          <ScrollView>
            <Text style={[styles.title, { alignSelf: "center" }]}>{name}</Text>
            <Image
              source={thumbnail ? { uri: thumbnail } : images.landscapePlaceholderImage}
              style={{
                width: IMAGE_WIDTH,
                height: IMAGE_HEIGHT,
                borderRadius: 8,
                marginTop: 10,
              }}
            />

            <Text style={[styles.title, { marginTop: 20 }]}>{eng.share_location}</Text>
            <MapView
              style={{
                width: IMAGE_WIDTH,
                height: IMAGE_HEIGHT,
                borderRadius: 8,
                marginTop: 10,
              }}
              region={position}
              onPress={() => {
                navigation.navigate("MapScreen")
              }}
            >
              <Marker
                coordinate={position}
                key={"1"}
                pinColor={palette.orange}
                draggable
                onDragEnd={({ nativeEvent: { coordinate } }) => {
                  // location: {
                  //   lat: coordinate.latitude,
                  //   long: coordinate.longitude,
                  // },
                  dispatch(
                    setTempStore({
                      ...tempPost,
                      location: {
                        lat: coordinate.latitude,
                        long: coordinate.longitude,
                      },
                    }),
                  )
                  // setPosition({
                  //   latitude: coordinate.latitude,
                  //   longitude: coordinate.longitude,
                  //   latitudeDelta: 0.02,
                  //   longitudeDelta: 0.02,
                  // })
                }}
              />
            </MapView>
            <Text style={[styles.title, { marginTop: 20 }]}>
              {eng.use_my_current_position}
            </Text>
            <Row
              containerStyle={{
                borderColor: "#EBEBEB",
                borderWidth: 1,
                borderRadius: 4,
                padding: 10,
                marginTop: 15,
                alignItems: "center",
              }}
            >
              <CurrentLocation />
              <Text style={[styles.location, { marginLeft: 10 }]}>{getLocation()}</Text>
            </Row>
            <AndroidBottomSpace />
          </ScrollView>
          <FooterCreatePost
            onPress={() => {
              navigation.navigate("AddContact")
            }}
            style={{ marginVertical: 20 }}
          />
        </View>
      </Screen>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  selected: {
    fontFamily: typography.regular,
    fontSize: fontSize.font13,
    color: "#808080",
  },
  dropdownStyle: {
    borderWidth: 1,
    borderColor: "#EBEBEB",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 4,
  },
  textInputStyle: {
    borderWidth: 1,
    borderColor: "#EBEBEB",
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontFamily: typography.regular,
    fontSize: fontSize.font16,
    borderRadius: 4,
  },
  labelStyle: {
    fontFamily: typography.regular,
    fontSize: fontSize.font16,
    marginVertical: 10,
  },
  text: {
    fontFamily: typography.medium,
    fontSize: fontSize.font16,
    color: "white",
  },
  button: {
    borderRadius: 20,
    paddingHorizontal: 25,
    paddingVertical: 7,
    backgroundColor: "#3653FE",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontFamily: typography.regular,
    fontWeight: "400",
    fontSize: fontSize.font20,
    marginTop: 10,
  },
  location: {
    fontFamily: typography.regular,
    fontWeight: "400",
    fontSize: fontSize.font16,
  },
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
  },
})
