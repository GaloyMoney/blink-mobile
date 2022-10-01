import * as React from "react"
import { useState,useEffect } from "react"
// eslint-disable-next-line react-native/split-platform-components
import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { Screen } from "../../components/screen"
import { fontSize, palette, typography } from "@app/theme"
import { HeaderComponent } from "@app/components/header"
import { images } from "@app/assets/images"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@app/redux"
import {
  MarketPlaceParamList,
  RootStackParamList,
} from "@app/navigation/stack-param-lists"
import { StackNavigationProp } from "@react-navigation/stack"
import { Row } from "@app/components/row"
import EditSvg from "@asset/svgs/edit-pen.svg"
import LocationSvg from "@asset/svgs/location.svg"
import EyeOffSvg from "@asset/svgs/eye-off.svg"
import EyeOnSvg from "@asset/svgs/eye-on.svg"
import LocationMarkerSvg from "@asset/svgs/location-marker.svg"
import { getLocation, openMap } from "@app/utils/helper"
import { eng } from "@app/constants/en"
import { RouteProp, useRoute } from "@react-navigation/native"
import { createPost } from "@app/graphql/second-graphql-client"
import { LoadingComponent } from "@app/components/loading-component"
import { CreatePostSuccessModal } from "@app/components/create-post-success-modal"
import { useTranslation } from "react-i18next"
const { width, height } = Dimensions.get("window")
interface Props {
  navigation: StackNavigationProp<MarketPlaceParamList>
}
const DetailComponent = ({editable}) => {
  const tempStore = useSelector((state: RootState) => state.storeReducer?.tempStore)
  const [isHidePhone,setIsHidePhone]=useState(false)
  const {t}=useTranslation()
  return (
    <View style={{ width: "100%" }}>
      <Row>
        <View style={detailStyle.rowItem}>
          <Text style={detailStyle.label}>{t("price")}</Text>
          <Text style={detailStyle.value}>$ {tempStore?.price || 0}</Text>
        </View>
      </Row>
      <Text style={detailStyle.label}>{t("description")}</Text>
      <Text style={detailStyle.value}>{tempStore?.description}</Text>

      <View style={detailStyle.rowItem}>
        <Row hc>
          <Text style={[detailStyle.label,{marginRight:5}]}>{t("phone_number")}</Text>
          {editable&&(<TouchableOpacity onPress={()=>setIsHidePhone(!isHidePhone)}>{isHidePhone ? <EyeOnSvg/> :<EyeOffSvg/>}</TouchableOpacity>)}
        </Row>
        <Text style={detailStyle.value}>{isHidePhone?'---------':tempStore?.phone}</Text>
      </View>
    </View>
  )
}
const detailStyle = StyleSheet.create({
  value: {
    color: "#9499A5",
    fontFamily: typography.regular,
    fontSize: fontSize.font15,
    marginTop: 5,
  },
  label: { color: "#212121", fontFamily: typography.medium, fontSize: fontSize.font16 },
  rowItem: { marginVertical: 10 },
})
export const StoreDetailScreen: React.FC<Props> = ({ navigation }) => {
  const route = useRoute<RouteProp<RootStackParamList, "StoreDetail">>()
  const editable = route.params.editable
  const [store, setStore] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const tempStore = useSelector((state: RootState) => state.storeReducer?.tempStore)
  const thumbnail = useSelector(
    (state: RootState) => state.storeReducer?.tempStore?.mainImageUrl,
  )
  const {t}=useTranslation()
  const formatRequestObject = (tempPost) => {
    return {
      ...tempPost,
      latitude: tempPost.location.lat,
      longitude: tempPost.location.long,
      categoryId: tempPost.category,
      price: parseFloat(tempPost.price || 0),
      userId: "hardcoded_user_id",
      address: "hardcoded_address",
    }
  }

  const onSubmit = async () => {
    try {
      setIsLoading(true)
      let request = formatRequestObject(tempStore)
      console.log("store: ", tempStore, request)
      let res = await createPost(request)

      setIsVisible(true)
    } catch (error) {
      Alert.alert(`Something goes wrong \n ${JSON.stringify(error)}`)
    } finally {
      setIsLoading(false)
    }
  }
  const getUri = ()=>{
    if(store) return  tempStore.mainImageUrl ? { uri: tempStore.mainImageUrl } : images.landscapePlaceholderImage
    return thumbnail ? { uri: thumbnail } : images.landscapePlaceholderImage
  }
  const renderContent =()=>{
    return (
      <View style={styles.contentContainer}>
        <Row containerStyle={styles.titleRow}>
          <Text style={[styles.title,{flex:1,paddingRight:10}]}>{store.name}</Text>
          <TouchableOpacity onPress={()=>{openMap(tempStore.location.lat,tempStore.location.long)}}>
            <Row containerStyle={styles.locationButtonContainer}>
              <Text style={styles.locationText}>{t("location")}</Text>
              <View style={styles.locationSvgContainer}>
                <LocationSvg fill={palette.orange}/>
              </View>
            </Row>
          </TouchableOpacity>
        </Row>
        <Row containerStyle={[{ marginTop: 5, alignItems: "center" }]}>
          <LocationMarkerSvg fill={palette.orange}/>
          <Text style={styles.addressText}>{getLocation(store.location)}</Text>
        </Row>
        
        <DetailComponent editable={editable}/>

        {editable ? (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={onSubmit}
          >
            <Text style={styles.locationText}>{t("submit")}</Text>
          </TouchableOpacity>
        ) : null}
      </View>)
  }
  const renderHeader = ()=>{
    return (
      <ImageBackground
        source={getUri()}
        style={styles.imageBackground}
      >
        <HeaderComponent
          style={{ paddingHorizontal: 20, marginTop: 10 }}
          rightComponent={
            editable ? (
              <TouchableOpacity activeOpacity={1} 
              onPress={()=>navigation.navigate("AddImage")}
              >
              <Row containerStyle={styles.headerRow}>
                <Text style={styles.headerText}>{t("update_cover_image")}</Text>
                <Image
                  source={images.uploadIcon}
                  style={{ width: 25, height: 19, marginLeft: 5 }}
                />
              </Row>
              </TouchableOpacity>
            ) : null
          }
        />
        {editable ? (
          <TouchableOpacity
            style={styles.editButtonContainer}
            onPress={() => navigation.navigate("CreatePost")}
          >
            <EditSvg fill={palette.orange}/>
          </TouchableOpacity>
        ) : null}
      </ImageBackground>
    )
  }
  useEffect(() => {
    if (route.params.storeInfor) {
      setStore(route.params.storeInfor)
    } else {
      setStore(tempStore)
    }
  }, [])
  return (
    <Screen style={styles.container}>
      {renderHeader()}
      {renderContent()}
      <LoadingComponent isLoading={isLoading} />
      <CreatePostSuccessModal
        isVisible={isVisible}
        onClose={() => {
          setIsVisible(false)
          navigation.navigate("MarketPlace")
        }}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  submitButton:{
    backgroundColor: palette.orange,
    alignSelf: "flex-end",
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginVertical: 15,
    borderRadius: 22,
  },
  contentContainer: { flex: 1, paddingHorizontal: 30, width: "100%",backgroundColor:palette.lighterGrey },
  locationSvgContainer: {
    borderRadius: 100,
    padding: 6,
    backgroundColor: "white",
    marginLeft: 7,
  },
  imageBackground: { width, height: height * 0.3, borderRadius: 8, marginTop: 10,zIndex:1 },
  value: {
    color: "#9499A5",
    fontFamily: typography.regular,
    fontSize: fontSize.font13,
    marginTop: 5,
  },
  headerRow: {
    backgroundColor: palette.orange,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    alignItems: "center",
  },
  headerText: {
    color: "white",
    fontFamily: typography.regular,
    fontSize: fontSize.font14,
  },
  addressText: {
    color: "#211414",
    fontFamily: typography.regular,
    fontSize: fontSize.font12,
    marginLeft: 5,
  },
  locationText: {
    color: "white",
    fontFamily: typography.medium,
    fontSize: fontSize.font14,
  },
  locationButtonContainer: {
    backgroundColor: palette.orange,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    alignSelf: "flex-start",
    alignItems: "center",
  },
  titleRow: { alignItems: "center", justifyContent: "space-between", marginTop: 30 },
  editButtonContainer: {
    position: "absolute",
    width: 58,
    height: 58,
    bottom: -24,
    right: 20,
    backgroundColor: "white",
    borderRadius: 54,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontFamily: typography.regular, fontWeight: "400", fontSize: fontSize.font20 },
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
  },
})
