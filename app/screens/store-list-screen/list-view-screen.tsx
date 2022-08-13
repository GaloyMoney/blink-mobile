import { HeaderComponent } from "@app/components/header"
import { Row } from "@app/components/row"
import { fontSize, GlobalStyles, spacing, typography } from "@app/theme"
import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
// eslint-disable-next-line react-native/split-platform-components
import {
  Dimensions,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { MarketPlaceParamList, RootStackParamList } from "../../navigation/stack-param-lists"
import { ScreenType } from "../../types/jsx"
import FilterSvg from "@asset/svgs/filter.svg"
import { eng } from "@app/constants/en"
import MapView, { Marker } from "react-native-maps"
import Geolocation from "@react-native-community/geolocation"
import { LandscapeDataComponent } from "./horizontal-store-component"
import ListIconSvg from '@asset/svgs/list-icon.svg'
import MapIconSvg from '@asset/svgs/map-indicator.svg'
import SpoonSvg from '@asset/svgs/spoon.svg'
import BottomSheet from '@gorhom/bottom-sheet';
import { useSelector } from "react-redux"
import { RootState } from "@app/redux"
import { StoreAttributes } from "@app/redux/reducers/store-reducer"
import { VerticalDataComponent } from "./vertical-store-component"
import { RouteProp, useRoute } from "@react-navigation/native"
const { width } = Dimensions.get("window") 
type Props = {
  navigation: StackNavigationProp<RootStackParamList>
}

export const StoreListViewScreen: React.FC<Props> = ({ navigation }) => {
  const route = useRoute<RouteProp<RootStackParamList, 'StoreListView'>>()
  const storeList = useSelector((state: RootState) => state.storeReducer.storeList)
  const [searchText, setSearchText] = React.useState('') 
  const flatlistRef = React.useRef<FlatList>()
 
  const renderData = ({ item }: { item: StoreAttributes, index: number }) => {
    return <VerticalDataComponent product={item}
      onItemPress={() => {
        navigation.navigate('StoreDetail', { editable: false, storeInfor: item })
      }}
    />
  }
 

  React.useEffect(() => {
    Geolocation.getCurrentPosition(
      (pos) => {
        // setPosition({
        //   latitude: crd.latitude,
        //   longitude: crd.longitude,
        //   latitudeDelta: 0.02,
        //   longitudeDelta: 0.02,
        // })
      },
      (err) => {
        console.log("err: ", err)
      },
    )
  }, [])
  React.useEffect(()=>{
    setSearchText(route.params.searchText)
  }, [route.params.searchText])
  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 1 }}>
        <SafeAreaView>
          <HeaderComponent style={{ paddingHorizontal: 20 }} />
          <Row containerStyle={styles.rowContainer}>
            <TextInput style={styles.searchText} placeholder={eng.search}
              value={searchText}
              onChangeText={setSearchText}
            />
            <FilterSvg />
          </Row>
        </SafeAreaView>
        <FlatList
          ref={flatlistRef}
          style={{marginTop:15}}
          data={storeList}
          numColumns={2} 
          columnWrapperStyle={{justifyContent:'space-between',paddingHorizontal:20}}
          renderItem={renderData}
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
          ListFooterComponent={() => <View style={{ height: 20 }} />}
          pagingEnabled 
          snapToAlignment={"start"}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  listViewText: { marginLeft: 7, color: '#3653FE', fontFamily: typography.medium, fontSize: fontSize.font16 },
  listViewButton: {
    padding: 14, backgroundColor: 'white', borderRadius: 36,
    alignSelf: 'flex-end', margin: 20, flexDirection: 'row', alignItems: 'center'
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  searchText: {
    flex: 1,
    fontFamily: typography.regular,
    fontSize: fontSize.font22,
  },
  rowContainer: {
    borderRadius: 20,
    ...GlobalStyles.shadow,
    backgroundColor: "white",
    paddingHorizontal: 30,
    paddingRight: spacing[3],
    paddingVertical: 9,
    alignItems: "center",
    marginHorizontal: 18,
  },
})
