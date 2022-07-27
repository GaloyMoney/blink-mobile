import { gql, useQuery } from "@apollo/client"
import { useFocusEffect } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
import { useCallback } from "react"
// eslint-disable-next-line react-native/split-platform-components
import { Dimensions, Image, PermissionsAndroid, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { Button } from "react-native-elements"
import MapView, { Callout, CalloutSubview, Marker } from "react-native-maps"
import { Screen } from "../../components/screen"
import { MarketPlaceParamList, PrimaryStackParamList } from "../../navigation/stack-param-lists"
import { ScreenType } from "../../types/jsx"
import { isIos } from "../../utils/helper"
import { translateUnknown as translate } from "@galoymoney/client"
import { palette } from "../../theme/palette"
import { toastShow } from "../../utils/toast"
import useToken from "../../utils/use-token"
import { fontSize, GlobalStyles, spacing, typography } from "@app/theme"
import { Row } from "@app/components/row"
import { eng } from "@app/constants/en"
import FilterSvg from "@asset/svgs/filter.svg"
import { images } from "@app/assets/images"
const { width, height } = Dimensions.get('window')
const IMAGE_WIDTH = width-32*2
const IMAGE_HEIGHT = IMAGE_WIDTH * 0.635
const QUERY_BUSINESSES = gql`
  query businessMapMarkers {
    businessMapMarkers {
      username
      mapInfo {
        title
        coordinates {
          longitude
          latitude
        }
      }
    }
  }
`


type Props = {
  navigation: StackNavigationProp<MarketPlaceParamList>
}

export const MarketPlace: ScreenType = ({ navigation }: Props) => { 
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Screen style={{ flex: 1, backgroundColor: '#E5E9EF', justifyContent: 'center', alignItems: 'center' }}>
        {/* <MapView
        style={styles.map}
        showsUserLocation={true}
        initialRegion={{
          latitude: 13.496743,
          longitude: -89.439462,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {markers}
      </MapView> */}
        <View style={styles.contentContainer}>
          <Row containerStyle={styles.rowContainer}>
            <TextInput
              style={styles.searchText}
              placeholder={eng.search}
            />
            <FilterSvg />
          </Row>
          <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
            <Image source={images.group} style={{height:IMAGE_HEIGHT,width:IMAGE_WIDTH}}/>
            <Text style={styles.description1}>{eng.post_what_would_you_like_too_offer_for_bitcoin}</Text>
          </View>
          <Row containerStyle={{justifyContent:'space-between',width:'100%',paddingHorizontal:15}}>
            <TouchableOpacity style={styles.button}
            onPress={()=>navigation.navigate('CreatePost')}
            > 
              <Text style={[styles.text]}>{eng.create_post}</Text>
            </TouchableOpacity>
            <View style={{width:30}}/>
            <TouchableOpacity style={[styles.button,styles.secondButton]}>
              <Text style={[styles.text,{color:'#3653FE'}]}>{eng.my_post}</Text>
            </TouchableOpacity>
          </Row>
        </View>
      </Screen>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  description1: { fontFamily: typography.regular, fontSize: fontSize.font14, color: palette.grey2, marginTop: 10 },
  searchText:{
    flex:1,
    fontFamily: typography.regular, fontSize: fontSize.font22,
  },
  rowContainer:{
    borderRadius: 20, ...GlobalStyles.shadow,
    backgroundColor: 'white',
    width: '100%',
    paddingHorizontal: 30,
    paddingRight:spacing[3],
    paddingVertical: 9,
    alignItems:'center'
  },
  contentContainer:{
    backgroundColor: 'white', borderRadius: 10,
    height: height * 0.7, width: width - spacing[4] * 2,
    shadowColor: '#000', ...GlobalStyles.shadow,
    justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 40, paddingBottom: 24,
    paddingHorizontal: spacing[4],
  },
  secondButton:{backgroundColor:'white',borderWidth:1,borderColor:'#3653FE'},
  button: {
    borderRadius: 20,
    paddingVertical: 7, backgroundColor: '#3653FE',
    justifyContent: 'center', alignItems: 'center',
    flex: 1
  },
  text: {
    fontFamily: typography.medium, fontSize: fontSize.font16,
    color:'white'
  },
  android: { marginTop: 18 },

  customView: {
    alignItems: "center",
    margin: 12,
  },

  ios: { paddingTop: 12 },

  map: {
    height: "100%",
    width: "100%",
  },

  title: { color: palette.darkGrey, fontSize: 18 },
}) 