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
import { Screen } from "../../components/screen"
import { fontSize, typography } from "@app/theme"
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

import { ReactNativeFile } from "apollo-upload-client"
import { gql, useMutation } from "@apollo/client"
import { uploadImage } from "@app/graphql/second-graphql-client"
import { LoadingComponent } from "@app/components/loading-component"
const { width, height } = Dimensions.get("window")
const IMAGE_WIDTH = width - 32 * 2
const IMAGE_HEIGHT = IMAGE_WIDTH * 0.635
interface Props {
  navigation: StackNavigationProp<MarketPlaceParamList>
}
function generateRNFile(uri, name, type) {
  return uri
    ? new ReactNativeFile({
        uri,
        type,
        name,
      })
    : null
}
const UPLOAD_IMAGE = gql`
  mutation uploadImage($image: Upload) {
    uploadImage(image: $image)
  }
`
export const AddImageScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch()
  const name = useSelector((state: RootState) => state.storeReducer?.tempStore?.name)
  const tempPost = useSelector((state: RootState) => state.storeReducer?.tempStore)
  const [pickedImages, setPickedImages] = useState(["", "", "", "", "", ""])
  const [remoteUrls, setRemoteUrls] = useState(["", "", "", "", "", ""])
  const [thumbnail, setThumbnail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isShowLoading, setIsShowloading] = useState(false)
  // const [uploadImage, { data, loading }] = useMutation(UPLOAD_IMAGE);
  const uploadSingle = async (uri, name, type) => {
    const file = generateRNFile(uri, name, type)
    // console.log('file: ',file);

    try {
      const url = await uploadImage(file)
      return url
    } catch (e) {
      console.log("error: ", JSON.stringify(e))
    }
  }
  const multipleUpload = (images) => {
    let promiseArray = []
    images.forEach((img, index) => {
      promiseArray.push(
        uploadSingle(
          Platform.OS === "android" ? img.path : img.sourceURL,
          img.filename,
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
          let res = await multipleUpload(images)
          setRemoteUrls(res)
          let tempPickedImgs = pickedImages.map((img, index) => {
            if (images.length - 1 < index) return img
            else
              return Platform.OS === "android"
                ? images[index].path
                : images[index].sourceURL
          })
          setPickedImages(tempPickedImgs)
        } catch (error) {
          Alert.alert(
            `Something wrong when try to upload images ${JSON.stringify(error)}`,
          )
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
        console.log("image: ", image)
        try {
          setIsLoading(true)
          const url = await uploadSingle(
            Platform.OS === "android" ? image.path : image.sourceURL,
            image.filename,
            image.mime,
          )
          let index = pickedImages.findIndex((path) => path == "")
          let tempPickedImgs = [...pickedImages]
          tempPickedImgs[index] = Platform.OS === "android" ? image.path : image.sourceURL

          let tempRemoteUrls = [...remoteUrls]
          tempRemoteUrls[index] = url
          setPickedImages(tempPickedImgs)
          setRemoteUrls(tempRemoteUrls)
        } catch (error) {
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
    else {
      let index = pickedImages.findIndex((localUrl) => localUrl == thumbnail)
      return remoteUrls[index]
    }
  }
  async function hasAndroidPermission() {
    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE

    const hasPermission = await PermissionsAndroid.check(permission)
    if (hasPermission) {
      return true
    }

    const status = await PermissionsAndroid.request(permission)
    return status === "granted"
  }
  const onItemClick = (item) => {
    if (pickedImages.filter((img) => img !== "").length === 0) handlePickMultiple()
    else if (item) {
      setThumbnail(item)
    } else {
      handlePickSingle()
    }
  }
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
              <Text style={[styles.title]}>{eng.upload_image}</Text>
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
                  renderItem={({ item,index }) => {
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
                                (!thumbnail&&pickedImages[0] &&index==0)||(thumbnail && thumbnail === item) ? "red" : "#EBEBEB",
                            },
                          ]}
                        />
                      </TouchableOpacity>
                    )
                  }}
                  horizontal
                  ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
                />
              </View>
              <Text style={[styles.selected, { marginTop: 10 }]}>
                {pickedImages.filter((img) => img !== "").length} {eng.image_uploaded}
              </Text>
            </ScrollView>
          </View>
          <FooterCreatePost
            onPress={() => {

              dispatch(
                setTempStore({
                  ...tempPost,
                  imagesUrls: remoteUrls.filter((url) => url != ""),
                  mainImageUrl: getMainImgUrl(),
                }),
              )
              navigation.navigate("AddLocation")
            }}
            style={{ marginVertical: 20 }}
          />
        </View>
        <LoadingComponent isLoading={isLoading} />
      </Screen>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
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
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
  },
})
