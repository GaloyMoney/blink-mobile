import * as React from "react"
import { useState } from "react"
// eslint-disable-next-line react-native/split-platform-components
import {
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { Screen } from "../../components/screen"
import { fontSize, typography } from "@app/theme"
import { HeaderComponent } from "@app/components/header"
import { images } from "@app/assets/images"
import { eng } from "@app/constants/en"
import { useDispatch } from "react-redux"
import { setTempStore } from "@app/redux/reducers/store-reducer"
import DropDownPicker from "react-native-dropdown-picker"
import { MarketPlaceParamList } from "@app/navigation/stack-param-lists"
import { StackNavigationProp } from "@react-navigation/stack"
import { CustomTextInput } from "@app/components/text-input"
const { width, height } = Dimensions.get("window")
const IMAGE_WIDTH = width - 32 * 2
const IMAGE_HEIGHT = IMAGE_WIDTH * 0.635
interface Props {
  navigation: StackNavigationProp<MarketPlaceParamList>
}
export const CreatePostScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch()
  const [name, setName] = useState("Burger Store")
  const [category, setCategory] = useState("Foods")
  const [description, setDescription] = useState(
    "The text was prefilled for faster testing",
  )
  const [open, setOpen] = useState(false)
  const [items] = useState([
    { label: "Foods", value: "Foods" },
    { label: "Drinks", value: "Drinks" },
  ])
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Screen style={styles.container} preset="fixed">
        <HeaderComponent style={{ paddingHorizontal: 20 }} />
        <Image source={images.backgroundSimple} style={{ width: 177, height: 158 }} />
        <Text style={styles.title}>{eng.register_store}</Text>
        <View style={{ paddingHorizontal: 30, width: "100%" }}>
          <CustomTextInput
            placeHolder={"Burger"}
            title={"Name"}
            onChangeText={setName}
            value={name}
          />
          <Text style={styles.labelStyle}>Category</Text>
          <DropDownPicker
            style={styles.dropdownStyle}
            textStyle={{
              fontFamily: typography.regular,
              fontSize: fontSize.font16,
            }}
            dropDownContainerStyle={{ borderColor: "#EBEBEB" }}
            placeholder={"Category"}
            placeholderStyle={{ color: "#c0c0c0" }}
            open={open}
            value={category}
            items={items}
            setOpen={setOpen}
            setValue={setCategory}
          />
          <CustomTextInput
            placeHolder={"Description ..."}
            title={"Description"}
            textField={true}
            onChangeText={setDescription}
            value={description}
          />
          <View style={{ alignItems: "flex-end", marginTop: 15 }}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                dispatch(setTempStore({ name, description, category }))
                navigation.navigate("AddImage")
              }}
            >
              <Text style={[styles.text]}>{eng.next}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Screen>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
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
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
  },
})
