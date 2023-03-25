import { useState, useRef } from "react"
import * as React from "react"
// eslint-disable-next-line react-native/split-platform-components
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { Screen } from "@app/components/screen"
import { HeaderComponent } from "../../components/header"
import { images } from "@app/modules/market-place/assets/images"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@app/modules/market-place/redux"
import { FooterCreatePost } from "../../components/footer-create-post/footer"
import { MarketPlaceParamList } from "@app/modules/market-place/navigation/param-list"
import { StackNavigationProp } from "@react-navigation/stack"
import CurrentLocation from "@app/modules/market-place/assets/svgs/current-location.svg"

import { AndroidBottomSpace } from "../../components/android-bottom-spacing/android-bottom-spacing"
import PhoneInput from "react-native-phone-number-input"
import { setTempPost } from "@app/modules/market-place/redux/reducers/store-reducer"
import { fontSize, typography } from "../../theme/typography"
import { Row } from "../../components/row"
import { CustomTextInput } from "../../components/text-input"
import { getLocation } from "../../utils/helper"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useAccountScreenQuery } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
const { width, height } = Dimensions.get("window")
const IMAGE_WIDTH = width - 30 * 2
const IMAGE_HEIGHT = IMAGE_WIDTH * 0.61
interface Props {
  navigation: StackNavigationProp<MarketPlaceParamList>
}
export const AddContactScreen: React.FC<Props> = ({ navigation }) => {
  const { LL: t } = useI18nContext()
  const isAuthed = useIsAuthed()
  const dispatch = useDispatch()
  const name = useSelector((state: RootState) => state.storeReducer?.tempPost?.name)
  const tempPost = useSelector((state: RootState) => state.storeReducer?.tempPost)
  const location = useSelector(
    (state: RootState) => state.storeReducer?.tempPost?.location,
  )
  const thumbnail = useSelector(
    (state: RootState) => state.storeReducer?.tempPost?.mainImageUrl,
  )
  const [phone] = useState("")
  const [email] = useState("")

  const { data } = useAccountScreenQuery({ fetchPolicy: "cache-first", skip: !isAuthed })
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <Screen style={styles.container}>
        <HeaderComponent style={{ paddingHorizontal: 20 }} />
        <View style={styles.contentContainer}>
          <ScrollView>
            <Text style={[styles.title, { alignSelf: "center" }]}>{name}</Text>
            <Image
              source={thumbnail ? { uri: thumbnail } : images.landscapePlaceholderImage}
              style={{
                width: IMAGE_WIDTH,
                height: IMAGE_HEIGHT,
                borderRadius: 8,
                marginTop: 10,
              }}
            />

            <Row containerStyle={styles.rowStyle}>
              <CurrentLocation />
              <Text
                style={[styles.location, { marginLeft: 10, flex: 1 }]}
                numberOfLines={1}
              >
                {getLocation(location)}
              </Text>
            </Row>
            <CustomTextInput
              placeHolder={t.marketPlace.account_contact_will_be_filled()}
              title={t.marketPlace.use_existing_information()}
              value={data?.me?.phone}
              disabled
            />

            <AndroidBottomSpace isPaddingBottom />
          </ScrollView>

          <FooterCreatePost
            onPress={() => {
              dispatch(
                setTempPost({
                  ...tempPost,
                  email: email || "TestMail@gmail.com",
                  phone,
                }),
              )
              navigation.navigate("ConfirmInformation", { editable: true })
            }}
            style={{ marginVertical: 20 }}
          />
        </View>
      </Screen>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  rowStyle: { marginTop: 15, alignItems: "center", alignSelf: "center" },
  contentContainer: { flex: 1, paddingHorizontal: 30, width: "100%" },
  rightComponent: {
    width: 42,
    backgroundColor: "rgba(69, 155, 13, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 3,
  },
  orText: {
    color: "#767676",
    fontSize: fontSize.font13,
    marginTop: 20,
    marginBottom: 10,
    alignSelf: "center",
  },
  selected: {
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
    fontSize: fontSize.font16,
    borderRadius: 4,
  },
  labelStyle: {
    fontSize: fontSize.font16,
    marginVertical: 10,
  },
  text: {
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
    fontWeight: "400",
    fontSize: fontSize.font20,
    marginTop: 10,
  },
  location: {
    fontWeight: "400",
    fontSize: fontSize.font16,
  },
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
  },
})
