import { gql } from "@apollo/client"
import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
// eslint-disable-next-line react-native/split-platform-components
import {
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { Screen } from "../../components/screen"
import { MarketPlaceParamList } from "../../navigation/stack-param-lists"
import { ScreenType } from "../../types/jsx"
import { palette } from "../../theme/palette"
import { fontSize, GlobalStyles, spacing, typography } from "@app/theme"
import { Row } from "@app/components/row"
import { eng } from "@app/constants/en"
import FilterSvg from "@asset/svgs/filter.svg"
import { images } from "@app/assets/images"
const { width, height } = Dimensions.get("window")
const IMAGE_WIDTH = width - 32 * 2
const IMAGE_HEIGHT = IMAGE_WIDTH * 0.635

type Props = {
  navigation: StackNavigationProp<MarketPlaceParamList>
}

export const MarketPlace: ScreenType = ({ navigation }: Props) => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Screen style={styles.screenContainer}>
        <View style={styles.contentContainer}>
            <Row containerStyle={styles.rowContainer}>
              <TextInput style={styles.searchText} placeholder={eng.search} editable={false}
              onPressIn={()=>{
                navigation.navigate('StoreList')
              }}
              />
              <FilterSvg />
            </Row>
          <View style={styles.imageRow}>
            <Image
              source={images.group}
              style={{ height: IMAGE_HEIGHT, width: IMAGE_WIDTH }}
            />
            <Text style={styles.description1}>
              {eng.post_what_would_you_like_too_offer_for_bitcoin}
            </Text>
          </View>
          <Row containerStyle={styles.buttonRow}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("CreatePost")}
            >
              <Text style={[styles.text]}>{eng.create_post}</Text>
            </TouchableOpacity>
            <View style={{ width: 30 }} />
            <TouchableOpacity style={[styles.button, styles.secondButton]}>
              <Text style={[styles.text, { color: "#3653FE" }]}>{eng.my_post}</Text>
            </TouchableOpacity>
          </Row>
        </View>
      </Screen>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  buttonRow: { justifyContent: "space-between", width: "100%", paddingHorizontal: 15 },
  imageRow: { flex: 1, justifyContent: "center", alignItems: "center" },
  screenContainer: {
    flex: 1,
    backgroundColor: "#E5E9EF",
    justifyContent: "center",
    alignItems: "center",
  },
  description1: {
    fontFamily: typography.regular,
    fontSize: fontSize.font14,
    color: palette.grey2,
    marginTop: 10,
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
    width: "100%",
    paddingHorizontal: 30,
    paddingRight: spacing[3],
    paddingVertical: 9,
    alignItems: "center",
  },
  contentContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    height: height * 0.7,
    width: width - spacing[4] * 2,
    shadowColor: "#000",
    ...GlobalStyles.shadow,
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 24,
    paddingHorizontal: spacing[4],
  },
  secondButton: { backgroundColor: "white", borderWidth: 1, borderColor: "#3653FE" },
  button: {
    borderRadius: 20,
    paddingVertical: 7,
    backgroundColor: "#3653FE",
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
