import * as React from "react"
import { useState, useEffect } from "react"
// eslint-disable-next-line react-native/split-platform-components
import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

import { color, palette } from "@app/theme"
import { HeaderComponent } from "../../components/header"
import { images } from "@app/modules/market-place/assets/images"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@app/modules/market-place/redux"
import { MarketPlaceParamList } from "@app/modules/market-place/navigation/param-list"
import { StackNavigationProp } from "@react-navigation/stack"
import EditSvg from "@app/modules/market-place/assets/svgs/edit-pen.svg"
import LocationSvg from "@app/modules/market-place/assets/svgs/location.svg"
import EyeOffSvg from "@app/modules/market-place/assets/svgs/eye-off.svg"
import EyeOnSvg from "@app/modules/market-place/assets/svgs/eye-on.svg"
import LocationMarkerSvg from "@app/modules/market-place/assets/svgs/location-marker.svg"
import { RouteProp, useRoute } from "@react-navigation/native"

import { LoadingComponent } from "@app/modules/market-place/components/loading-component"
import { clearTempStore } from "@app/modules/market-place/redux/reducers/store-reducer"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { Screen } from "@app/components/screen"
import { TagComponent } from "../../components/tag-components"
import { useI18nContext } from "@app/i18n/i18n-react"
import { Row } from "../../components/row"
import { fontSize, typography } from "../../theme/typography"
import { getLocation, openMap } from "../../utils/helper"
import { CreatePostSuccessModal } from "../../components/create-post-success-modal"
import { createPost, createTag } from "../../graphql"

const { width, height } = Dimensions.get("window")
interface Props {
  navigation: StackNavigationProp<MarketPlaceParamList>
}
const DetailComponent = ({ editable, isHidePhone, setIsHidePhone, post }) => {
  const { LL: t } = useI18nContext()

  const renderTags = () => {
    return post?.tags?.map((tag) => {
      return <TagComponent title={tag.name} key={tag.name} style={{ marginRight: 10 }} />
    })
  }
  return (
    <View style={{ width: "100%" }}>
      <View style={detailStyle.rowItem}>
        <Text style={detailStyle.label}>{t.marketPlace.tags()}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 10 }}
        >
          {renderTags()}
        </ScrollView>
      </View>
      <Text style={detailStyle.label}>{t.marketPlace.description()}</Text>
      <Text style={detailStyle.value}>{post?.description}</Text>

      <View style={detailStyle.rowItem}>
        <Row hc>
          <Text style={[detailStyle.label, { marginRight: 5 }]}>
            {t.marketPlace.phone_number()}
          </Text>
          {editable && (
            <TouchableOpacity onPress={() => setIsHidePhone(!isHidePhone)}>
              {isHidePhone ? <EyeOnSvg /> : <EyeOffSvg />}
            </TouchableOpacity>
          )}
        </Row>
        <Text style={detailStyle.value}>
          {isHidePhone ? "---------" : post?.phone || post?.owner?.phoneNumber}
        </Text>
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
export const PostDetailScreen: React.FC<Props> = ({ navigation }) => {
  const route = useRoute<RouteProp<RootStackParamList, "PostDetail">>()

  const [isHidePhone, setIsHidePhone] = useState(false)
  const editable = route.params.editable
  const [store, setStore] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const dispatch = useDispatch()

  const tempPost = useSelector((state: RootState) => state.storeReducer?.tempPost)
  const thumbnail = useSelector(
    (state: RootState) => state.storeReducer?.tempPost?.mainImageUrl,
  )

  const { LL: t } = useI18nContext()
  const formatRequestObject = (tempPost) => {
    return {
      ...tempPost,
      hidePhoneNumber: isHidePhone,
      tagsIds: tempPost.tags?.map((item) => item._id),
      latitude: store.location.lat,
      longitude: store.location.long,
      categoryId: store.category,
      price: parseFloat(store.price || 0),
      userId: "hardcoded_user_id",
      address: store.address || getLocation(store.location),
      phoneNumber: tempPost.phone,
    }
  }

  const onSubmit = async () => {
    try {
      setIsLoading(true)

      let modifiedTempPost = { ...tempPost }
      const skipCreateTag = tempPost.tags?.every((tag) => tag._id)

      if (!skipCreateTag) {
        const requests = modifiedTempPost.tags
          .filter((tag) => !tag._id)
          .map((tag) => createTag(tag.name))
        const res = await Promise.all(requests)
        const newTags = [...res, ...tempPost.tags].filter((tag) => tag._id)
        modifiedTempPost = { ...tempPost, tags: newTags }
      }

      const request = formatRequestObject(modifiedTempPost)
      console.log("request===============: ", JSON.stringify(request))
      const res = await createPost(request)

      setIsVisible(true)
    } catch (error) {
      Alert.alert(`Something goes wrong`, `${JSON.stringify(error)}`)
    } finally {
      setIsLoading(false)
    }
  }
  const getUri = () => {
    if (store)
      return store.mainImageUrl
        ? { uri: store.mainImageUrl }
        : images.landscapePlaceholderImage
    return thumbnail ? { uri: thumbnail } : images.landscapePlaceholderImage
  }
  const renderContent = () => {
    return (
      <View style={styles.contentContainer}>
        <Row containerStyle={styles.titleRow}>
          <Text style={[styles.title, { flex: 1, paddingRight: 10 }]}>{store.name}</Text>
          <TouchableOpacity
            onPress={() => {
              openMap(store.location.lat, store.location.long)
            }}
          >
            <Row containerStyle={styles.locationButtonContainer}>
              <Text style={styles.locationText}>{t.marketPlace.location()}</Text>
              <View style={styles.locationSvgContainer}>
                <LocationSvg fill={color.primary} />
              </View>
            </Row>
          </TouchableOpacity>
        </Row>
        <Row containerStyle={[{ marginTop: 5, alignItems: "center" }]}>
          <LocationMarkerSvg fill={color.primary} />
          <Text style={styles.addressText}>
            {store?.address || getLocation(store.location)}
          </Text>
        </Row>

        <DetailComponent
          editable={editable}
          setIsHidePhone={setIsHidePhone}
          isHidePhone={isHidePhone}
          post={store}
        />

        {editable ? (
          <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
            <Text style={styles.locationText}>{t.marketPlace.submit()}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    )
  }
  const renderHeader = () => {
    return (
      <ImageBackground source={getUri()} style={styles.imageBackground}>
        <HeaderComponent
          style={{ paddingHorizontal: 20, marginTop: 10 }}
          rightComponent={
            editable ? (
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => navigation.navigate("AddImage")}
              >
                <Row containerStyle={styles.headerRow}>
                  <Text style={styles.headerText}>
                    {t.marketPlace.update_cover_image()}
                  </Text>
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
            <EditSvg fill={color.primary} />
          </TouchableOpacity>
        ) : null}
      </ImageBackground>
    )
  }
  useEffect(() => {
    if (route.params.storeInfor) {
      const { owner } = route.params.storeInfor
      const { hidePhoneNumber, phoneNumber } = owner || {}
      console.log("owner: ", owner, route.params)

      setStore(route.params.storeInfor)
      setIsHidePhone(hidePhoneNumber)
    } else {
      setStore(tempPost)
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
          dispatch(clearTempStore())
          setIsVisible(false)
          navigation.navigate("MarketPlace")
        }}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  submitButton: {
    backgroundColor: color.primary,
    alignSelf: "flex-end",
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginVertical: 15,
    borderRadius: 22,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 30,
    width: "100%",
    backgroundColor: palette.lighterGrey,
  },
  locationSvgContainer: {
    borderRadius: 100,
    padding: 6,
    backgroundColor: "white",
    marginLeft: 7,
  },
  imageBackground: {
    width,
    height: height * 0.3,
    borderRadius: 8,
    marginTop: 10,
    zIndex: 1,
  },
  value: {
    color: "#9499A5",
    fontFamily: typography.regular,
    fontSize: fontSize.font13,
    marginTop: 5,
  },
  headerRow: {
    backgroundColor: color.primary,
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
    backgroundColor: color.primary,
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
