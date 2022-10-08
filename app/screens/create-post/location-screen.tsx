import * as React from "react"
import { useState } from "react"
// eslint-disable-next-line react-native/split-platform-components
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { Screen } from "../../components/screen"
import { fontSize, palette, typography } from "@app/theme"
import { HeaderComponent } from "@app/components/header"
import { images } from "@app/assets/images"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@app/redux"
import { FooterCreatePost } from "./footer"
import { MarketPlaceParamList } from "@app/navigation/stack-param-lists"
import { StackNavigationProp } from "@react-navigation/stack"
import { setTempPost } from "@app/redux/reducers/store-reducer"
import MapView, { Marker } from "react-native-maps"
import Geolocation from "@react-native-community/geolocation"
import CurrentLocation from "@asset/svgs/current-location.svg"
import { Row } from "@app/components/row"
import { AndroidBottomSpace } from "./android-bottom-spacing"
import useMainQuery from "@app/hooks/use-main-query"
import { useTranslation } from "react-i18next"
const { width, height } = Dimensions.get("window")
const IMAGE_WIDTH = width - 30 * 2
const IMAGE_HEIGHT = IMAGE_WIDTH * 0.61
interface Props {
  navigation: StackNavigationProp<MarketPlaceParamList>
}
export const AddLocationScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch()
  const name = useSelector((state: RootState) => state.storeReducer?.tempPost?.name)
  const tempPost = useSelector((state: RootState) => state.storeReducer?.tempPost)
  const location = useSelector(
    (state: RootState) => state.storeReducer?.tempPost?.location,
  )
  const thumbnail = useSelector(
    (state: RootState) => state.storeReducer?.tempPost?.mainImageUrl,
  )

  const { phoneNumber } = useMainQuery()
  const [position, setPosition] = useState({
    latitude: 10,
    longitude: 10,
    latitudeDelta: 0.001,
    longitudeDelta: 0.001,
  })
  const { t } = useTranslation()
  const getLocation = () => {
    if (!location || !location?.lat || !location?.long) return ""
    return `Lat: ${location.lat}, Long: ${location.long}`
  }
  React.useEffect(() => {
    Geolocation.getCurrentPosition(
      (pos) => {
        const crd = pos.coords
        dispatch(
          setTempPost({
            ...tempPost,
            location: {
              lat: crd.latitude,
              long: crd.longitude
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

            <Text style={[styles.title, { marginTop: 20 }]}>{t("share_location")}</Text>
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
                  dispatch(
                    setTempPost({
                      ...tempPost,
                      location: {
                        lat: coordinate.latitude,
                        long: coordinate.longitude,
                      },
                    }),
                  )
                }}
              />
            </MapView>
            <Text style={[styles.title, { marginTop: 20 }]}>
              {t("select_your_address")}
            </Text>
            <Row
              containerStyle={styles.rowContainer}
              onPress={()=>{}}
            >
              <CurrentLocation fill={palette.orange} />
              <Text style={[styles.location, { marginLeft: 10 }]}>{}</Text>
            </Row>
            <AndroidBottomSpace />
          </ScrollView>
          <FooterCreatePost
            disableSkip
            onPress={() => {
              dispatch(
                setTempPost({
                  ...tempPost,
                  email: "TestMail@gmail.com",
                  phone: phoneNumber,
                }),
              )
              navigation.navigate("ConfirmInformation", { editable: true })
            }}
            style={{ marginVertical: 20 }}
          />
        </View>
      </Screen>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  rowContainer: {
    backgroundColor: 'white',
    borderColor: "#EBEBEB",
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    marginTop: 15,
    alignItems: "center",
  },
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
    backgroundColor: palette.lighterGrey,
    alignItems: "center",
  },
})
