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
const { width } = Dimensions.get("window")

const itemWidth = 330;

type Props = {
  navigation: StackNavigationProp<RootStackParamList>
}

export const StoreListScreen: ScreenType = ({ navigation }: Props) => {
  const storeList = useSelector((state: RootState) => state.storeReducer.storeList)
  const mapRef = React.useRef<MapView>()
  const flatlistRef = React.useRef<FlatList>()
  const [searchText, setSearchText] = React.useState('')
  const [markerRefs, setMarkerRef] = React.useState([])
  const [position, setPosition] = React.useState({
    latitude: 9.9227376,
    longitude: -84.0748629,
    latitudeDelta: 0.001,
    longitudeDelta: 0.001,
  })

  const snapToOffsets = storeList.map((x, i) => {
    if (i == 0) return (i * itemWidth)
    return (i * (itemWidth + 20))
  })

  const renderData = ({ item, index }: { item: StoreAttributes, index: number }) => {
    return <LandscapeDataComponent
      product={item}
      onItemPress={() => {
        navigation.navigate('StoreDetail',{editable:false,storeInfor:item})
      }}
      onLocationPress={() => {
        mapRef.current?.animateCamera({ center: { latitude: item.location.lat, longitude: item.location.long }, })
        markerRefs[index]?.current?.showCallout()
        console.log(markerRefs);

        flatlistRef.current?.scrollToOffset({ animated: true, offset: snapToOffsets[index] })
      }} />
  }

  const renderMarkers = () => {
    return storeList.map((data, index) => <Marker

      // ref={markerRefs[index]} 
      title={data.name}
      coordinate={{
        latitude: data.location.lat,
        longitude: data.location.long
      }}
      draggable={false}
      onPress={() => { flatlistRef.current.scrollToOffset({ animated: true, offset: snapToOffsets[index] }) }}
    >
      <View style={{ width: 63, height: 60, alignItems: 'center' }}>

        <MapIconSvg />
        <Row containerStyle={{ position: 'absolute', width: 58, height: 40, alignItems: 'center', justifyContent: 'center' }}>
          <SpoonSvg />
          <Text style={{ marginLeft: 5, fontSize: fontSize.font16, fontFamily: typography.medium, color: 'white' }}>{data.rating}</Text>
        </Row>
      </View>
    </Marker>)
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

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 1 }}>
        <MapView
          style={styles.map}
          region={position}
          showsCompass={true}
          scrollEnabled={true}
          zoomEnabled={true}
          pitchEnabled={true}
          rotateEnabled={true}
          ref={mapRef}
        >
          <Marker
            title="Yor are here"
            coordinate={position}
            draggable={false}
            onPress={() => console.log('helloooo')}

          />
          {renderMarkers()}
        </MapView>
        <SafeAreaView>
          <HeaderComponent style={{ paddingHorizontal: 20 }} />
          <Row containerStyle={styles.rowContainer}>
            <TextInput
              style={styles.searchText} placeholder={eng.search}
              value={searchText}
              onChangeText={setSearchText}
            />
            <FilterSvg />
          </Row>
        </SafeAreaView>
        <View style={{ position: 'absolute', bottom: 20 }}>
          <TouchableOpacity
            style={styles.listViewButton}
            onPress={() => navigation.navigate('StoreListView', { searchText })}
          >
            <ListIconSvg />
            <Text style={styles.listViewText}>List View</Text>
          </TouchableOpacity>
          <FlatList
            ref={flatlistRef}
            data={storeList}
            renderItem={renderData}
            horizontal
            showsHorizontalScrollIndicator={false}
            ListHeaderComponent={() => <View style={{ width: 20 }} />}
            ItemSeparatorComponent={() => <View style={{ width: 20 }} />}
            ListFooterComponent={() => <View style={{ width: 20 }} />}
            pagingEnabled
            snapToOffsets={snapToOffsets}
            snapToAlignment={"start"}
          />
        </View>
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
