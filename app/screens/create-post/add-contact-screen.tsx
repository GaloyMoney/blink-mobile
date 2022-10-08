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
import { Screen } from "../../components/screen"
import { fontSize, typography } from "@app/theme"
import { HeaderComponent } from "@app/components/header"
import { images } from "@app/assets/images"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@app/redux"
import { FooterCreatePost } from "./footer"
import { MarketPlaceParamList } from "@app/navigation/stack-param-lists"
import { StackNavigationProp } from "@react-navigation/stack"
import CurrentLocation from "@asset/svgs/current-location.svg"
import CheckSvg from "@asset/svgs/check-icon.svg"
import { Row } from "@app/components/row"
import { CustomTextInput } from "@app/components/text-input"
import { getLocation } from "@app/utils/helper"
import { AndroidBottomSpace } from "./android-bottom-spacing"
import { eng } from "@app/constants/en"
import PhoneInput from "react-native-phone-number-input"
import { translateUnknown as translate } from "@galoymoney/client"
import { setTempPost } from "@app/redux/reducers/store-reducer"
import useMainQuery from "@app/hooks/use-main-query"
const { width, height } = Dimensions.get("window")
const IMAGE_WIDTH = width - 30 * 2
const IMAGE_HEIGHT = IMAGE_WIDTH * 0.61
interface Props {
  navigation: StackNavigationProp<MarketPlaceParamList>
}
export const AddContactScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch()
  const name = useSelector((state: RootState) => state.storeReducer?.tempPost?.name)
  const tempPost = useSelector((state: RootState) => state.storeReducer?.tempPost)
  const location = useSelector(
    (state: RootState) => state.storeReducer?.tempPost?.location,
  )
  const thumbnail = useSelector(
    (state: RootState) => state.storeReducer?.tempPost?.mainImageUrl,
  )
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  // const [phoneNumber, setPhoneNumber] = useState("")

  const phoneInputRef = useRef<PhoneInput | null>()

  const { btcWalletId, username, phoneNumber, userPreferredLanguage } = useMainQuery()
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
              placeHolder={eng.account_contact_will_be_filled}
              title={eng.use_existing_information}
              value={phoneNumber}
              disabled
            />
            {/* <Text style={styles.orText}>Or</Text> */}
            {/* <CustomTextInput
              placeHolder={eng.phone_number}
              title={eng.phone}
              onChangeText={setPhone}
              value={phone}
            /> */}

            {/* <Row>
              <PhoneInput
                ref={phoneInputRef}
                value={phoneNumber}
                containerStyle={{
                  marginVertical: 0,
                  paddingVertical: 0,
                  borderWidth: 1,
                  borderColor: "#EBEBEB",
                  borderRadius: 4,
                  flex: 1,
                  backgroundColor: "white",
                }}
                textContainerStyle={{ paddingVertical: 10, backgroundColor: "white" }}
                textInputStyle={{
                  fontFamily: typography.regular,
                  fontSize: fontSize.font16,
                }}
                defaultValue={phoneNumber}
                defaultCode="SV"
                layout="first"
                textInputProps={{
                  placeholder: translate("WelcomePhoneInputScreen.placeholder"),
                  keyboardType: "phone-pad",
                  textContentType: "telephoneNumber",
                  accessibilityLabel: "Input phone number",
                }}
                countryPickerProps={{
                  modalProps: {
                    testID: "country-picker",
                  },
                }}
                codeTextStyle={{ marginLeft: -25 }}
                // onChangeText={setPhone}
                onChangeFormattedText={setPhone}
              />

              <TouchableOpacity style={styles.rightComponent} onPress={() => {}}>
                <CheckSvg />
              </TouchableOpacity>
            </Row> */}
            {/* <Text style={styles.orText}>Or</Text>
            <CustomTextInput
              placeHolder={eng.email}
              title={eng.email}
              onChangeText={setEmail}
              value={email}
            /> */}

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
    fontFamily: typography.bold,
    color: "#767676",
    fontSize: fontSize.font13,
    marginTop: 20,
    marginBottom: 10,
    alignSelf: "center",
  },
  selected: {
    fontFamily: typography.regular,
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
    fontFamily: typography.regular,
    fontSize: fontSize.font16,
    borderRadius: 4,
  },
  labelStyle: {
    fontFamily: typography.regular,
    fontSize: fontSize.font16,
    marginVertical: 10,
  },
  text: {
    fontFamily: typography.medium,
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
    fontFamily: typography.regular,
    fontWeight: "400",
    fontSize: fontSize.font20,
    marginTop: 10,
  },
  location: {
    fontFamily: typography.regular,
    fontWeight: "400",
    fontSize: fontSize.font16,
  },
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
  },
})
