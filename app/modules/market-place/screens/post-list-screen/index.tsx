import { HeaderComponent } from "../../components/header"

import { spacing } from "@app/theme"
import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
import { useState, useEffect, useRef } from "react"
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

import FilterSvg from "@app/modules/market-place/assets/svgs/filter.svg"
import MapView, { Marker } from "react-native-maps"
import Geolocation from "@react-native-community/geolocation"
import { HorizontalPostComponent } from "../../components/horizontal-post/horizontal-post-component"
import ListIconSvg from "@app/modules/market-place/assets/svgs/list-icon.svg"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@app/modules/market-place/redux"
import { setPostList } from "@app/modules/market-place/redux/reducers/store-reducer"
import { filterPosts } from "@app/modules/market-place/graphql"
import { LoadingComponent } from "@app/modules/market-place/components/loading-component"
import { debounce } from "lodash"
import { EmptyComponent } from "./components/empty-component"
import { setLocation } from "@app/modules/market-place/redux/reducers/user-reducer"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { MarketPlaceCommonStyle } from "@app/modules/market-place/theme/style"
import { openMap } from "../../utils/helper"
import { DefaultFilterPostModel } from "../../models"
import { Row } from "../../components/row"
import { useI18nContext } from "@app/i18n/i18n-react"
import { fontSize, typography } from "../../theme/typography"
import { useFocusEffect } from "@react-navigation/native"
const { width } = Dimensions.get("window")

const itemWidth = 330

type Props = {
  navigation: StackNavigationProp<RootStackParamList>
}

export const StoreListScreen = ({ navigation }: Props) => {
  const postList = useSelector((state: RootState) => state.storeReducer.postList)
  const [isLoading, setIsLoading] = useState(false)
  const dispatch = useDispatch()
  const mapRef = useRef<MapView>()
  const flatlistRef = useRef<FlatList>()
  const [searchText, setSearchText] = useState("")
  const [markerRefs, setMarkerRef] = useState([])
  const [position, setPosition] = useState(undefined)
  const { LL: t } = useI18nContext()

  const snapToOffsets = postList.map((x, i) => {
    if (i == 0) return i * itemWidth
    return i * (itemWidth + 20)
  })

  const renderData = ({ item, index }: { item: any; index: number }) => {
    const { coordinates } = item?.location || {}
    return (
      <HorizontalPostComponent
        product={item}
        onItemPress={() => {
          navigation.navigate("PostDetail", { editable: false, postInfo: item })
        }}
        onLocationPress={() => {
          if (!coordinates || coordinates.length < 2) return
          mapRef.current?.animateCamera({
            center: { latitude: coordinates[1], longitude: coordinates[0] },
          })
          markerRefs[index]?.current?.showCallout()
          console.log(markerRefs)

          flatlistRef.current?.scrollToOffset({
            animated: true,
            offset: snapToOffsets[index],
          })
        }}
        onDirectionPress={() => {
          if (!coordinates || coordinates.length < 2) return
          openMap(coordinates[1], coordinates[0])
        }}
      />
    )
  }

  const renderMarkers = () => {
    return postList.map((data, index) => {
      if (!data.location) return null
      return (
        <Marker
          title={data.name}
          coordinate={{
            latitude: data.location?.coordinates[1],
            longitude: data.location?.coordinates[0],
          }}
          draggable={false}
          onPress={() => {
            flatlistRef.current.scrollToOffset({
              animated: true,
              offset: snapToOffsets[index],
            })
          }}
        ></Marker>
      )
    })
  }

  const searchPostDebounce = React.useMemo(
    () =>
      debounce(async () => {
        setIsLoading(true)
        if(!position) return 
        const { latitude, longitude } = position
        
        const res = await filterPosts({
          latitude,
          longitude,
          maxDistance: 20000,
          minDistance: 0,
          text: searchText,
        })
        dispatch(setPostList(res))
        setIsLoading(false)
      }, 500),
    [searchText],
  )

  const initData = async (latitude:number, longitude:number) => {
    try {
      setIsLoading(true)
      const posts = await filterPosts({ ...DefaultFilterPostModel, latitude, longitude })
      
      dispatch(setPostList(posts))
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }
  useEffect(() => {
    searchPostDebounce()
    return () => searchPostDebounce.cancel()
  }, [searchPostDebounce])

  useFocusEffect(
    React.useCallback(() => {
      Geolocation.getCurrentPosition(
        ({ coords: { latitude, longitude } }) => {
          setPosition({
            latitude,
            longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          })
          dispatch(setLocation({ lat: latitude, long: longitude }))
          initData(latitude, longitude)
          
        },
        (err) => {
          console.log("err when fetch location: ", err)
        },
      )
    }, [])
  );
  if (!position) return (
    <View style={{ flex: 1, backgroundColor: "white", justifyContent: 'center', alignItems: 'center' }}>
      <Text>{t.marketPlace.you_need_to_enable_location_to_see_posts_around_you()}</Text>
    </View>
  )

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
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
          {renderMarkers()}
        </MapView>
        <SafeAreaView>
          <HeaderComponent style={{ paddingHorizontal: 20 }} />
          <Row containerStyle={styles.rowContainer}>
            <TextInput
              style={styles.searchText}
              placeholder={t.marketPlace.search()}
              value={searchText}
              onChangeText={setSearchText}
            />
            <FilterSvg />
          </Row>
        </SafeAreaView>
        <View style={{ position: "absolute", bottom: 20, width: "100%" }}>
          {postList?.length ? (
            <TouchableOpacity
              style={styles.listViewButton}
              onPress={() => navigation.navigate("StoreListView", { searchText })}
            >
              <ListIconSvg />
              <Text style={styles.listViewText}>{t.marketPlace.list_view()}</Text>
            </TouchableOpacity>
          ) : null}
          <FlatList
            ref={flatlistRef}
            data={postList}
            renderItem={renderData}
            horizontal
            showsHorizontalScrollIndicator={false}
            ListHeaderComponent={() => <View style={{ width: 20 }} />}
            ItemSeparatorComponent={() => <View style={{ width: 20 }} />}
            ListFooterComponent={() => <View style={{ width: 20 }} />}
            pagingEnabled
            snapToOffsets={snapToOffsets}
            snapToAlignment={"start"}
            ListEmptyComponent={() => <EmptyComponent />}
          />
        </View>
      </View>
      <LoadingComponent isLoading={isLoading} />
    </View>
  )
}

const styles = StyleSheet.create({
  listViewText: {
    marginLeft: 7,
    color: "#3653FE",
    fontSize: fontSize.font16,
  },
  listViewButton: {
    padding: 14,
    backgroundColor: "white",
    borderRadius: 36,
    alignSelf: "flex-end",
    margin: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  searchText: {
    flex: 1,
    fontSize: fontSize.font22,
  },
  rowContainer: {
    borderRadius: 20,
    ...MarketPlaceCommonStyle.shadow,
    backgroundColor: "white",
    paddingHorizontal: 30,
    paddingRight: spacing[3],
    paddingVertical: 9,
    alignItems: "center",
    marginHorizontal: 18,
    marginTop: 15,
  },
})
