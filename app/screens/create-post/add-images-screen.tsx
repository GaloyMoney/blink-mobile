import * as React from "react"
import { useState } from 'react'
// eslint-disable-next-line react-native/split-platform-components
import { Dimensions, FlatList, Image, PermissionsAndroid, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Screen } from "../../components/screen"
import { fontSize, typography } from "@app/theme"
import { HeaderComponent } from "@app/components/header"
import { images } from "@app/assets/images"
import { eng } from "@app/constants/en"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@app/redux"
import ImagePicker from 'react-native-image-crop-picker';
import { FooterCreatePost } from "./footer"
import { MarketPlaceParamList } from "@app/navigation/stack-param-lists"
import { StackNavigationProp } from "@react-navigation/stack"
import { setTempStore } from "@app/redux/reducers/store-reducer"
const { width, height } = Dimensions.get('window')
const IMAGE_WIDTH = width - 32 * 2
const IMAGE_HEIGHT = IMAGE_WIDTH * 0.635
interface Props {
  navigation: StackNavigationProp<MarketPlaceParamList>
}
export const AddImageScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch()
  const name = useSelector((state: RootState) => state.storeReducer?.tempStore?.name)
  const [pickedImages, setPickedImages] = useState(['', '', '', '', '', ''])
  const [thumbnail, setThumbnail] = useState('')
  const handlePickMultiple = async () => {
    console.log('run in pick multple===');

    if (Platform.OS === 'android' && !(await hasAndroidPermission())) {
      return;
    }
    ImagePicker.openPicker({
      multiple: true,
      maxFiles: 6
    }).then(images => {
      console.log('images: ',images);
      
      // only override picked image from library to existed array
      // example
      // current array:  [path1,path2,path3,path4,...]
      // picked array:   [path11,path22]
      // expected array: [path11,path22,path3,path4,...]
      let tempPickedImgs = pickedImages.map((img, index) => {
        if (images.length - 1 < index) return img
        else return Platform.OS==='android'?images[index].path: images[index].sourceURL
      })
      setPickedImages(tempPickedImgs)
    }).catch(err=>{
      console.log('err==== 3',err);
      
    });;
  }
  const handlePickSingle = async () => {
    console.log('run in pick single =====');
    
    // add selected images to the first empty image
    ImagePicker.openPicker({
    }).then(image => {
      console.log('images==: ',image);
      let index = pickedImages.findIndex(path => path == '')
      let tempPickedImgs = [...pickedImages]

      tempPickedImgs[index] = Platform.OS==='android'?image.path:image.sourceURL
      setPickedImages(tempPickedImgs)
    }).catch(err=>{
      console.log('err====2 ',err);
      
    });
  }

  async function hasAndroidPermission() {
    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

    const hasPermission = await PermissionsAndroid.check(permission);
    if (hasPermission) {
      return true;
    }

    const status = await PermissionsAndroid.request(permission);
    return status === 'granted';
  }

  const GallerySelection = async () => {
    if (Platform.OS === 'android' && !(await hasAndroidPermission())) {
      return;
    }
    ImagePicker.openPicker({ multiple: true })
      .then((images) => {
        console.log(images);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Screen style={styles.container}
        preset="fixed"
      >
        <HeaderComponent style={{ paddingHorizontal: 20 }} />
        <Image source={images.backgroundSimple} style={{ width: 177, height: 158 }} />
        <Text style={styles.title}>{name}</Text>
        <View style={{ flex: 1, paddingHorizontal: 30, width: '100%' }}>

          <Text style={[styles.title]}>Upload Image</Text>
          <TouchableOpacity disabled={thumbnail !== '' || pickedImages[0] !== ''}
            onPress={handlePickMultiple}
          >
            <Image source={thumbnail ? { uri: thumbnail } : (!pickedImages[0]) ? images.placeholderImage : { uri: pickedImages[0] }}
              style={{ width: 122, height: 122, marginVertical: 15, borderWidth: 1, borderRadius: 4, borderColor: '#EBEBEB' }}
            />
          </TouchableOpacity>
          <View>
            {console.log('pickedImages: ', pickedImages)
            }
            <FlatList
              data={pickedImages}
              keyExtractor={(_, index) => 'images' + index}
              renderItem={({ item, index }) => {
                return <TouchableOpacity
                  onPress={() => {
                    console.log('item: ', item);
                    if (pickedImages.filter(img => img !== '').length === 0) handlePickMultiple()
                    else if (item) {
                      setThumbnail(item)
                    } else {
                      handlePickSingle()
                    }
                  }}
                >
                  <Image source={item ? { uri: item } : images.placeholderImage}
                    style={{ width: 50, height: 50, borderRadius: 4, borderColor: (thumbnail && thumbnail === item) ? 'red' : '#EBEBEB', borderWidth: 1 }}
                  />
                </TouchableOpacity>
              }}
              horizontal
              ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
            />
          </View>
          <Text style={[styles.selected, { marginTop: 10 }]}>{pickedImages.filter(img => img !== '').length} Image uploaded</Text>

          <FooterCreatePost
            onPress={() => { 
              dispatch(setTempStore({images,thumbnail:thumbnail||pickedImages[0]||''}))
              navigation.navigate('AddLocation') 
            }}
            style={{ position: 'absolute', bottom: 0, left: 30, marginBottom: 20 }}
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
    color: '#808080'
  },
  dropdownStyle: {
    borderWidth: 1, borderColor: '#EBEBEB', paddingVertical: 10,
    paddingHorizontal: 15, borderRadius: 4
  },
  textInputStyle: {
    borderWidth: 1, borderColor: '#EBEBEB', paddingVertical: 10,
    paddingHorizontal: 15, fontFamily: typography.regular,
    fontSize: fontSize.font16, borderRadius: 4
  },
  labelStyle: { fontFamily: typography.regular, fontSize: fontSize.font16, marginVertical: 10 },
  text: {
    fontFamily: typography.medium, fontSize: fontSize.font16,
    color: 'white'
  },
  button: {
    borderRadius: 20, paddingHorizontal: 25,
    paddingVertical: 7, backgroundColor: '#3653FE',
    justifyContent: 'center', alignItems: 'center',
  },
  title: { fontFamily: typography.regular, fontWeight: '400', fontSize: fontSize.font20, marginTop: 10 },
  container: {
    flex: 1, backgroundColor: '#fff',
    alignItems: 'center',
  }
})