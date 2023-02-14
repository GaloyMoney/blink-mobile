import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
// eslint-disable-next-line react-native/split-platform-components
import {
  Alert,
  Dimensions,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { Screen } from "@app/components/screen"
import { MarketPlaceParamList } from "@app/modules/market-place/navigation/param-list"

import { color, palette, spacing } from "@app/theme"
import FilterSvg from "@app/modules/market-place/assets/svgs/filter.svg"
import { images } from "@app/modules/market-place/assets/images"
import { useDispatch } from "react-redux"
import { clearTempStore } from "@app/modules/market-place/redux/reducers/store-reducer"
import { MarketPlaceCommonStyle } from "../../theme/style"
import { useI18nContext } from "@app/i18n/i18n-react"
import { Row } from "../../components/row"
import { fontSize, typography } from "../../theme/typography"
import useToken from "@app/hooks/use-token"
import { UnAuthModal } from "../../components/UnAuthModal"
import messaging from '@react-native-firebase/messaging';

const { width, height } = Dimensions.get("window")
const IMAGE_WIDTH = width - 32 * 2
const IMAGE_HEIGHT = IMAGE_WIDTH * 0.635

type Props = {
  navigation: StackNavigationProp<MarketPlaceParamList>
}
// TODO: add auth check when create post
// TODO: add login pop up
export const MarketPlace = ({ navigation }: Props) => {
  const [isModalVisible, setIsModalVisible] = React.useState(false)
  const { hasToken } = useToken()

  const { LL: t } = useI18nContext()
  const dispatch = useDispatch()

  const goesToStoreList = () => navigation.navigate("StoreList")


  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Screen style={styles.screenContainer}>
        <View style={styles.contentContainer}>
          <Pressable
            onPress={goesToStoreList}
          >

            <Row containerStyle={styles.rowContainer}>
              <Text style={styles.searchText}>{t.marketPlace.search()}</Text>
              <FilterSvg />
            </Row>
          </Pressable>
          <View style={styles.imageRow}>
            <Image
              source={images.group}
              style={{ height: IMAGE_HEIGHT, width: IMAGE_WIDTH }}
            />
            <Text style={styles.description1}>
              {t.marketPlace.post_what_would_you_like_too_offer_for_bitcoin()}
            </Text>
          </View>
          <Row containerStyle={styles.buttonRow}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                dispatch(clearTempStore())
                hasToken ? navigation.navigate("CreatePost") : setIsModalVisible(true)
              }}
            >
              <Text style={styles.text}>{t.marketPlace.create_post()}</Text>
            </TouchableOpacity>
            <View style={{ width: 30 }} />
            <TouchableOpacity
              style={[styles.button, styles.secondButton]}
              onPress={() => {
                // navigation.navigate("LocationPicker")
                hasToken ? navigation.navigate("MyPost") : setIsModalVisible(true)
              }}
            >
              <Text style={[styles.text, { color: color.primary }]}>
                {t.marketPlace.my_post()}
              </Text>
            </TouchableOpacity>
          </Row>
        </View>
        <UnAuthModal modalVisible={isModalVisible} setModalVisible={setIsModalVisible} />
      </Screen>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  buttonRow: { justifyContent: "space-between", width: "100%", paddingHorizontal: 15 },
  imageRow: { flex: 1, justifyContent: "center", alignItems: "center" },
  screenContainer: {
    flex: 1,
    backgroundColor: palette.lighterGrey,
    justifyContent: "center",
    alignItems: "center",
  },
  description1: {
    fontFamily: typography.regular,
    fontSize: fontSize.font14,
    color: palette.midGrey,
    marginTop: 10,
  },
  searchText: {
    flex: 1,
    fontFamily: typography.regular,
    fontSize: fontSize.font22,
    color:"#9499A5",
    paddingVertical: Platform.OS == "android" ? 10 : 0
  },
  rowContainer: {
    borderRadius: 20,
    ...MarketPlaceCommonStyle.shadow,
    backgroundColor: "white",
    width: "100%",
    paddingHorizontal: 30,
    paddingRight: spacing[3],
    paddingVertical: Platform.OS === 'android' ? 0 : 9,
    alignItems: "center",
  },
  contentContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    height: height * 0.7,
    width: width - spacing[4] * 2,
    shadowColor: "#000",
    ...MarketPlaceCommonStyle.shadow,
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 24,
    paddingHorizontal: spacing[4],
  },
  secondButton: { backgroundColor: "white", borderWidth: 1, borderColor: color.primary },
  button: {
    borderRadius: 20,
    paddingVertical: 7,
    backgroundColor: color.primary,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  text: {
    fontFamily: typography.medium,
    fontSize: fontSize.font16,
    color: "white",
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
