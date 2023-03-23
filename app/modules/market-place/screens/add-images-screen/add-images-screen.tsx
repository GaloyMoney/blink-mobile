import * as React from "react"
import { useState } from "react"
// eslint-disable-next-line react-native/split-platform-components
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { Screen } from "@app/components/screen"
import { palette } from "@app/theme"

import { images } from "@app/modules/market-place/assets/images"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@app/modules/market-place/redux"
import ImagePicker from "react-native-image-crop-picker"
import { FooterCreatePost } from "../../components/footer-create-post/footer"
import { MarketPlaceParamList } from "@app/modules/market-place/navigation/param-list"
import { StackNavigationProp } from "@react-navigation/stack"
import { setTempPost } from "@app/modules/market-place/redux/reducers/store-reducer"

import { LoadingComponent } from "@app/modules/market-place/components/loading-component"
import { HeaderComponent } from "../../components/header"
import { fontSize, typography } from "../../theme/typography"
import { useI18nContext } from "@app/i18n/i18n-react"
import { uploadImage } from "../../graphql"
import { useAppConfig } from "@app/hooks"
import { GRAPHQL_MARKET_PLACE_MAINNET_URI, GRAPHQL_MARKET_PLACE_STAGING_URI } from "../../config"
const { width, height } = Dimensions.get("window")
const IMAGE_WIDTH = width - 32 * 2
const IMAGE_HEIGHT = IMAGE_WIDTH * 0.635
interface Props {
  navigation: StackNavigationProp<MarketPlaceParamList>
}

export const AddImageScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch()
  const name = useSelector((state: RootState) => state.storeReducer?.tempPost?.name)
  const tempPost = useSelector((state: RootState) => state.storeReducer?.tempPost)
  const [pickedImages, setPickedImages] = useState(["", "", "", "", "", ""])
  const [remoteUrls, setRemoteUrls] = useState(["", "", "", "", "", ""])
  const [thumbnail, setThumbnail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { appConfig: { galoyInstance: { name:instanceName } } } = useAppConfig()

  
  const baseUrl = instanceName === "Staging" ? GRAPHQL_MARKET_PLACE_STAGING_URI : GRAPHQL_MARKET_PLACE_MAINNET_URI

  const { LL: t } = useI18nContext()
  
  // delete image at selected index
  // replace deleted image with the next image
  const handleDeleteImage = (index: number) => {
    const tempImages = [...pickedImages];
    const tempRemoteUrl = [...remoteUrls];

    tempImages.splice(index, 1);
    tempImages.push('')

    tempRemoteUrl.splice(index, 1);

    
    setPickedImages(tempImages);
    setRemoteUrls(tempRemoteUrl);
    setThumbnail(tempImages[0])

  }

  const handleErrorUploadImages = () => {
    setRemoteUrls(["", "", "", "", "", ""])
    setPickedImages(["", "", "", "", "", ""])
    setThumbnail("")
    Alert.alert("Something wrong when upload image")
  }

  const uploadSingle = async (uri: string, name: string, type: string) => {
    //remove /graphql at the end of the url
    const uploadUrl = baseUrl.substring(0, baseUrl.length - 8)

    try {
      const url = await uploadImage(uri, name, type, uploadUrl)

      return url
    } catch (e: any) {
      console.log("error: ", JSON.stringify(e.message))
    }
  }
  
  const multipleUpload = (images: any[]) => {
    const promiseArray: any[] = []

    images.forEach((img: { path: string; sourceURL: string; filename: string; mime: string }) => {
      const arrPath = Platform.OS === "android" ? img?.path?.split("/") : []
      promiseArray.push(
        uploadSingle(
          Platform.OS === "android" ? img.path : img.sourceURL,
          Platform.OS === "android" ? arrPath[arrPath.length - 1] : img.filename,
          img.mime,
        ).then((url) => {
          return url
        }),
      )
    })

    return Promise.all(promiseArray)
  }

  const handlePickMultiple = async () => {
    if (Platform.OS === "android" && !(await hasAndroidPermission())) {
      return
    }

    ImagePicker.openPicker({
      multiple: true,
      maxFiles: 6,
    })
      .then(async (images) => {
        try {
          setIsLoading(true)

          const res = await multipleUpload(images)

          const isError = res.some((url) => url == undefined)

          if (isError) throw new Error('error upload images ')

          setRemoteUrls(res)

          const tempPickedImgs = pickedImages.map((img, index) => {

            if (images.length - 1 < index) return img

            return Platform.OS === "android"
              ? images[index].path
              : images[index].sourceURL

          })

          setPickedImages(tempPickedImgs)
        } catch (error) {
          
          handleErrorUploadImages()
          console.log('error===');
          
        } finally {
          setIsLoading(false)
        }
      })
      .catch((err) => {
        console.warn(err)
      })
  }

  const handlePickSingle = async () => {
    // add selected images to the first empty image
    ImagePicker.openPicker({})
      .then(async (image) => {
        try {
          setIsLoading(true)
          const arrPath = Platform.OS === "android" ? image?.path?.split("/") : []

          const url = await uploadSingle(
            Platform.OS === "android" ? image.path : image.sourceURL,
            Platform.OS === "android" ? arrPath[arrPath.length - 1] : image.filename,
            image.mime,
          )

          const isError = url === undefined
          if (isError) throw new Error('error upload images ')

          const index = pickedImages.findIndex((path) => path == "")
          const tempPickedImgs = [...pickedImages]

          tempPickedImgs[index] = Platform.OS === "android" ? image.path : image.sourceURL
          const tempRemoteUrls = [...remoteUrls]
          tempRemoteUrls[index] = url

          setPickedImages(tempPickedImgs)
          setRemoteUrls(tempRemoteUrls)
        } catch (error) {

          handleErrorUploadImages()
        } finally {
          setIsLoading(false)
        }
      })
      .catch((err) => {
        console.warn("err ", err)
      })
  }

  const getMainImgUrl = () => {
    if (!thumbnail) return remoteUrls[0]

    const index = pickedImages.findIndex((localUrl) => localUrl == thumbnail)
    return remoteUrls[index]

  }

  const hasAndroidPermission = async () => {
    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE

    const hasPermission = await PermissionsAndroid.check(permission)
    if (hasPermission) {
      return true
    }

    const status = await PermissionsAndroid.request(permission)
    return status === "granted"
  }

  const onItemClick = (item: React.SetStateAction<string>) => {
    // if there is no picked image, handle pick multiple case
    if (pickedImages.filter((img) => img !== "").length === 0) handlePickMultiple()
    // if select a uploaded image, set it as thubmnail
    else if (item) setThumbnail(item)
    // if click on the empty image, and there is selected image, handle upload single case
    else handlePickSingle()
  }

  const renderPickedImages = ({ item, index }: { item: any, index: number }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          onItemClick(item)
        }}
      >
        <Image
          source={item ? { uri: item } : images.placeholderImage}
          style={[
            styles.imageStyle,
            {
              borderColor:
                (!thumbnail && pickedImages[0] && index == 0) ||
                  (thumbnail && thumbnail === item)
                  ? "red"
                  : "#EBEBEB",
            },
          ]}
        />
        {item && (
        <TouchableOpacity style={styles.deleteIcon} onPress={()=>handleDeleteImage(index)}>
          <Text style={{fontSize:10}}>x</Text>
        </TouchableOpacity>)}
      </TouchableOpacity>
    )
  }

  const onNextPress = () => {
    if (!getMainImgUrl())
      return Alert.alert(t.marketPlace.you_must_add_at_least_one_image())
    dispatch(
      setTempPost({
        ...tempPost,
        imagesUrls: remoteUrls.filter((url) => url != ""),
        mainImageUrl: getMainImgUrl(),
      }),
    )
    navigation.navigate("AddLocation")
  }

  React.useEffect(() => {
    if (tempPost.imagesUrls?.length) {
      const selectedImages = new Array(5).fill("")

      pickedImages.forEach((_, index) => {
        selectedImages[index] = tempPost.imagesUrls?.[index] || ""
      })

      setRemoteUrls(selectedImages)
      setPickedImages(selectedImages)
      setThumbnail(selectedImages[0])
      
    }
  }, [])

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Screen style={styles.container} preset="fixed">
        <HeaderComponent style={{ paddingHorizontal: 20 }} />
        <View style={{ flex: 1, paddingHorizontal: 30, width: "100%" }}>
          <View style={{ flex: 1 }}>
            <ScrollView>
              <Image
                source={images.backgroundSimple}
                style={{ width: 177, height: 158, alignSelf: "center" }}
              />
              <Text style={[styles.title, { alignSelf: "center" }]}>{name}</Text>
              <Text style={styles.title}>{t.marketPlace.upload_image()}</Text>
              <TouchableOpacity
                disabled={thumbnail !== "" || pickedImages[0] !== ""}
                onPress={handlePickMultiple}
              >
                <Image
                  source={
                    thumbnail
                      ? { uri: thumbnail }
                      : !pickedImages[0]
                        ? images.placeholderImage
                        : { uri: pickedImages[0] }
                  }
                  style={styles.thumbnailImageStyle}
                />
              </TouchableOpacity>
              <View>
                <FlatList
                  data={pickedImages}
                  keyExtractor={(_, index) => "images" + index}
                  renderItem={renderPickedImages}
                  horizontal
                  ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
                />
              </View>
              <Text style={[styles.selected, { marginTop: 10 }]}>
                {pickedImages.filter((img) => img !== "").length}{" "}
                {t.marketPlace.image_uploaded()}
              </Text>
            </ScrollView>
          </View>
          <FooterCreatePost
            disableSkip
            onPress={onNextPress}
            style={{ marginVertical: 20 }}
          />
        </View>
        <LoadingComponent isLoading={isLoading} />
      </Screen>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  deleteIcon:{
    justifyContent: 'center', alignItems: 'center', width: 15,
    height: 15, backgroundColor: palette.lighterGrey,
    position:'absolute',
    right:0, borderRadius:15
  },
  thumbnailImageStyle: {
    width: 122,
    height: 122,
    marginVertical: 15,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: "#EBEBEB",
  },
  imageStyle: { width: 50, height: 50, borderRadius: 4, borderWidth: 1 },
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
  container: {
    flex: 1,
    backgroundColor: palette.lighterGrey,
    alignItems: "center",
  },
})
