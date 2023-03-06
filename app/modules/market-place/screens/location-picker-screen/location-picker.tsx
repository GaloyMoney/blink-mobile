import { HeaderComponent } from "../../components/header"
import { autoComplete, getPlaceCoordinates } from "@app/modules/market-place/graphql"
import { RootState } from "@app/modules/market-place/redux"
import { setTempPost } from "@app/modules/market-place/redux/reducers/store-reducer"
import { color, palette } from "@app/theme"
import { useNavigation } from "@react-navigation/native"
import React, { useEffect, useState } from "react"
import {
  TouchableOpacity,
  StyleSheet,
  View,
  FlatList,
  SafeAreaView,
  Text,
  Dimensions,
  Alert,
} from "react-native"
import { useDispatch, useSelector } from "react-redux"
import { useI18nContext } from "@app/i18n/i18n-react"
import { GoogleMapLocation } from "../../models"
import TextInputComponent from "../../components/text-input-component"

export interface LocationPickProps {
  debounce?: number 
}
const { width } = Dimensions.get("window")
export const LocationPickerScreen = (props: LocationPickProps) => {
  const { debounce = 500 } = props
  const { LL: t } = useI18nContext()
  const [keyword, setKeyword] = useState("")
  const [results, setResults] = useState([])
  const [isFetching, setIsFetching] = useState(false)
  const [search, setSearch]: any = useState(null)
  const tempPost = useSelector((state: RootState) => state.storeReducer.tempPost)
  const dispatch = useDispatch()
  const navigation = useNavigation()
  useEffect(() => {
    clearTimeout(search)
    setSearch(null)

    if (keyword.trim().length > 0) {
      setSearch(
        setTimeout(() => {
          setResults([])
          setIsFetching(true)
          autoComplete(keyword)
            .then((places) => {
              setResults(places)
            })
            .catch(() => {
              Alert.alert("Something wrong when find location")
            })
            .finally(() => setIsFetching(false))
        }, debounce),
      )
    }

    return () => {
      clearTimeout(search)
      setSearch(null)
    }
  }, [keyword])

  const selectLocation = async (item: GoogleMapLocation) => {
    try {
      setIsFetching(true)
      const coords = await getPlaceCoordinates(item.id)
      dispatch(
        setTempPost({
          ...tempPost,
          location: {
            lat: coords.latitude,
            long: coords.longitude,
          },
          address: item.name,
        }),
      )
      navigation.goBack()
    } catch (error) {
    } finally {
      setIsFetching(false)
    }
  }

  return (
    <SafeAreaView style={styles.modalContainer}>
      <HeaderComponent
        title={t.marketPlace.search_your_location()}
        style={{ paddingHorizontal: 20, alignItems: "center" }}
      />
      <View style={styles.searchPanel}>
        <View style={styles.textInputContainer}>
          <TextInputComponent
            value={keyword}
            onChangeText={(text) => setKeyword(text)}
            placeholder={t.marketPlace.search_your_location()}
            style={{ flex: 1, borderWidth: 0 }}
            containerStyle={{ borderWidth: 0 }}
          />
        </View>
      </View>

      {isFetching && <Text style={styles.loadingText}>Loading data...</Text>}

      <FlatList
        data={results}
        renderItem={({ item }: { item: GoogleMapLocation }) => {
          return (
            <TouchableOpacity
              style={[
                styles.optionItemContainer,
                {
                  borderBottomColor: color.primary,
                },
              ]}
              onPress={() => selectLocation(item)}
            >
              <Text numberOfLines={1}>{item.name}</Text>
            </TouchableOpacity>
          )
        }}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={styles.optionContentContainer}
        keyboardShouldPersistTaps="always"
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  textInputContainer: {
    borderColor: color.primary,
    backgroundColor: "white",
    flexDirection: "row",
    borderWidth: 2,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  header: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingBottom: 7,
    justifyContent: "center",
    flexDirection: "row",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
    zIndex: 3,
  },
  title: {
    fontSize: 24,
  },
  subTitleLabel: {
    textTransform: "uppercase",
  },
  close: {
    position: "absolute",
    left: 0,
    paddingLeft: 2,
    bottom: 10,
  },
  triggerPanel: {
    position: "relative",
  },
  trigger: {
    zIndex: 3,
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  searchPanel: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomColor: color.primary,
    borderBottomWidth: 1,
  },
  modalContainer: {
    backgroundColor: palette.lighterGrey,
    flex: 1,
  },
  loadingText: {
    padding: 15,
  },
  optionItemContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  optionContentContainer: {
    paddingBottom: 20,
  },
})
