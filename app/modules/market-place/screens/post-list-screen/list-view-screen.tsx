import { HeaderComponent } from "../../components/header"
import { spacing } from "@app/theme"
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
  View,
} from "react-native"
import FilterSvg from "@app/modules/market-place/assets/svgs/filter.svg"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@app/modules/market-place/redux"
import {
  PostAttributes,
  setPostList,
} from "@app/modules/market-place/redux/reducers/store-reducer"
import { VerticalDataComponent } from "./vertical-store-component"
import { RouteProp, useRoute } from "@react-navigation/native"
import { debounce } from "lodash"
import { filterPosts } from "@app/modules/market-place/graphql"
import { LoadingComponent } from "@app/modules/market-place/components/loading-component"
import { MarketPlaceCommonStyle } from "../../theme/style"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { useI18nContext } from "@app/i18n/i18n-react"
import { Row } from "../../components/row"
import { fontSize, typography } from "../../theme/typography"
const { width } = Dimensions.get("window")
type Props = {
  navigation: StackNavigationProp<RootStackParamList>
}

export const StoreListViewScreen: React.FC<Props> = ({ navigation }) => {
  const route = useRoute<RouteProp<RootStackParamList, "StoreListView">>()
  const storeList = useSelector((state: RootState) => state.storeReducer.postList)
  const position = useSelector((state: RootState) => state.userReducer.location)
  const [searchText, setSearchText] = React.useState("")
  const flatlistRef = React.useRef<FlatList>()
  const [isLoading, setIsLoading] = React.useState(false)
  const dispatch = useDispatch()

  const { LL: t } = useI18nContext()

  const searchPostDebounce = React.useMemo(
    () =>
      debounce(async () => {
        setIsLoading(true)
        const { lat: latitude, long: longitude } = position
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

  React.useEffect(() => {
    searchPostDebounce()
    return () => searchPostDebounce.cancel()
  }, [searchPostDebounce])

  const renderData = ({ item }: { item: PostAttributes; index: number }) => {
    return (
      <VerticalDataComponent
        product={item}
        onItemPress={() => {
          navigation.navigate("PostDetail", { editable: false, storeInfor: item })
        }}
      />
    )
  }

  React.useEffect(() => {
    setSearchText(route.params.searchText)
  }, [route.params.searchText])
  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ flex: 1 }}>
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
        <FlatList
          ref={flatlistRef}
          style={{ marginTop: 15 }}
          showsVerticalScrollIndicator={false}
          data={storeList}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: 20 }}
          renderItem={renderData}
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
          ListFooterComponent={() => <View style={{ height: 20 }} />}
          pagingEnabled
          snapToAlignment={"start"}
          ListEmptyComponent={() => (
            <Text style={styles.emptyText}>There are no posts around you</Text>
          )}
        />
      </View>
      <LoadingComponent isLoading={isLoading} />
    </View>
  )
}

const styles = StyleSheet.create({
  emptyText: {
    fontFamily: typography.medium,
    fontSize: fontSize.font18,
    color: "#9499A5",
    alignSelf: "center",
    marginTop: 150,
  },
  listViewText: {
    marginLeft: 7,
    color: "#3653FE",
    fontFamily: typography.medium,
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
    fontFamily: typography.regular,
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
