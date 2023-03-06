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
import { Screen } from "@app/components/screen"
import { color, palette } from "@app/theme"
import { HeaderComponent } from "../../components/header"
import { images } from "@app/modules/market-place/assets/images"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@app/modules/market-place/redux"
import { FooterCreatePost } from "../../components/footer-create-post/footer"
import { StackNavigationProp } from "@react-navigation/stack"
import { setTempPost } from "@app/modules/market-place/redux/reducers/store-reducer"
import MapView, { Marker } from "react-native-maps"
import Geolocation from "@react-native-community/geolocation"
import CurrentLocation from "@app/modules/market-place/assets/svgs/current-location.svg"
import { AndroidBottomSpace } from "../../components/android-bottom-spacing/android-bottom-spacing"
import { useFocusEffect } from "@react-navigation/native"
import { useI18nContext } from "@app/i18n/i18n-react"
import { Row } from "../../components/row"
import { fontSize, typography } from "../../theme/typography"
import { useAccountScreenQuery } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
const { width } = Dimensions.get("window")
const IMAGE_WIDTH = width - 30 * 2
const IMAGE_HEIGHT = IMAGE_WIDTH * 0.61
interface Props {
  navigation: StackNavigationProp<any>
}
export const FindLocationScreen: React.FC<Props> = ({ navigation }) => {
  const isAuthed = useIsAuthed()
  const dispatch = useDispatch()
  const name = useSelector((state: RootState) => state.storeReducer?.tempPost?.name)
  const tempPost = useSelector((state: RootState) => state.storeReducer?.tempPost)
  const location = useSelector(
    (state: RootState) => state.storeReducer?.tempPost?.location,
  )
  const thumbnail = useSelector(
    (state: RootState) => state.storeReducer?.tempPost?.mainImageUrl,
  )

  const { data } = useAccountScreenQuery({ fetchPolicy: "cache-first", skip: !isAuthed })
  
  const [position, setPosition] = useState({
    latitude: 10,
    longitude: 10,
    latitudeDelta: 0.001,
    longitudeDelta: 0.001,
  })
  const { LL: t } = useI18nContext()

  React.useEffect(() => {
    if (!tempPost?.location?.lat) {
      Geolocation.getCurrentPosition(
        (pos) => {
          const crd = pos.coords
          dispatch(
            setTempPost({
              ...tempPost,
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
          console.log("err when fetch location: ", err)
        },
      )
    }
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      if (tempPost?.location?.lat) {
        const { lat, long } = tempPost.location

        setPosition({ ...position, latitude: lat, longitude: long })
      }
    }, [tempPost.location?.lat]),
  )
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <Screen style={styles.container}>
        <HeaderComponent style={{ paddingHorizontal: 20 }} title={name} />
        <View style={{ flex: 1, paddingHorizontal: 30, width: "100%" }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Image
              source={thumbnail ? { uri: thumbnail } : images.landscapePlaceholderImage}
              style={{
                width: IMAGE_WIDTH,
                height: IMAGE_HEIGHT,
                borderRadius: 8,
                marginTop: 10,
              }}
            />

            <Text style={[styles.title, { marginTop: 20 }]}>
              {t.marketPlace.use_my_current_position()}
            </Text>
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
                pinColor={color.primary}
                onDragEnd={({ nativeEvent: { coordinate } }) => {
                  dispatch(
                    setTempPost({
                      ...tempPost,
                      location: {
                        lat: coordinate.latitude,
                        long: coordinate.longitude,
                      },
                      address: "",
                    }),
                  )
                }}
              />
              <Text>123</Text>
            </MapView>
            <Text style={[styles.title, { marginTop: 20 }]}>
              {t.marketPlace.or_select_your_address()}
            </Text>
            <Row
              containerStyle={styles.rowContainer}
              onPress={() => {
                navigation.navigate("LocationPicker")
              }}
            >
              <CurrentLocation fill={color.primary} />
              <Text style={[styles.location, { marginLeft: 10, flex: 1 }]}>
                {tempPost.address || "Tap to find your place"}
              </Text>
            </Row>
            <FooterCreatePost
              disableSkip
              onPress={() => {
                dispatch(
                  setTempPost({
                    ...tempPost,
                    email: "TestMail@gmail.com",
                    phone: data?.me?.phone,
                  }),
                )
                navigation.navigate("ConfirmInformation", { editable: true })
              }}
              style={{ marginVertical: 20 }}
            />
            <AndroidBottomSpace />
          </ScrollView>
        </View>
      </Screen>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  rowContainer: {
    backgroundColor: "white",
    borderColor: "#EBEBEB",
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    marginTop: 15,
    alignItems: "center",
  },
  selected: {
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
    fontSize: fontSize.font16,
    borderRadius: 4,
  },
  labelStyle: { 
    fontSize: fontSize.font16,
    marginVertical: 10,
  },
  text: { 
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
    fontWeight: "400",
    fontSize: fontSize.font20,
    marginTop: 10,
  },
  location: {
    fontWeight: "400",
    fontSize: fontSize.font16,
  },
  container: {
    flex: 1,
    backgroundColor: palette.lighterGrey,
    alignItems: "center",
  },
})
