import * as React from "react"
import { useState } from "react"
// eslint-disable-next-line react-native/split-platform-components
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { Screen } from "../../components/screen"
import { color, fontSize, GlobalStyles, palette, typography } from "@app/theme"
import { HeaderComponent } from "@app/components/header"
import { images } from "@app/assets/images"
import { eng } from "@app/constants/en"
import { useDispatch, useSelector } from "react-redux"
import { setTempPost } from "@app/redux/reducers/store-reducer"
import { MarketPlaceParamList } from "@app/navigation/stack-param-lists"
import { StackNavigationProp } from "@react-navigation/stack"
import TextInputComponent from "@app/components/text-input-component"
import { LoadingComponent } from "@app/components/loading-component"
import { useTranslation } from "react-i18next"
import { Row } from "@app/components/row"
import XSvg from '@asset/svgs/x.svg'
import { MarketplaceTag, TemplateMarketPlaceTag } from "@app/constants/model"
import { autoCompleteTags, getTags } from "@app/graphql/second-graphql-client"
import { RootState } from "@app/redux"
import { TagComponent } from "@app/components/tag-components"
const { width, height } = Dimensions.get("window")
const FAKE_TAGS = [
  {
    "_id": "633868d33e3e998e4c674303",
    "createdAt": "1664641235567",
    "name": "restaurants",
    "updatedAt": "1664641235567"
  },
  {
    "_id": "633868c93e3e998e4c674300",
    "createdAt": "1664641225401",
    "name": "vehicle",
    "updatedAt": "1664641225401"
  },
  {
    "_id": "633868b33e3e998e4c6742fd",
    "createdAt": "1664641203639",
    "name": "Tag #2",
    "updatedAt": "1664641203639"
  },
  {
    "_id": "633842fbf55946fb0c4cc09a",
    "createdAt": "1664631547736",
    "name": "Tag #1",
    "updatedAt": "1664631547736"
  },
  {
    "_id": "633842fbf55946fb0c4cc09a1",
    "createdAt": "1664631547736",
    "name": "Tag #2",
    "updatedAt": "1664631547736"
  },
  {
    "_id": "633842fbf55946fb0c4cc09a2",
    "createdAt": "1664631547736",
    "name": "Tag #2",
    "updatedAt": "1664631547736"
  },
  {
    "_id": "633842fbf55946fb0c4cc09a3",
    "createdAt": "1664631547736",
    "name": "Tag #3",
    "updatedAt": "1664631547736"
  },
  {
    "_id": "633842fbf55946fb0c4cc09a4",
    "createdAt": "1664631547736",
    "name": "Tag #4",
    "updatedAt": "1664631547736"
  },
  {
    "_id": "633842fbf55946fb0c4cc09a5",
    "createdAt": "1664631547736",
    "name": "Tag #5",
    "updatedAt": "1664631547736"
  },
  {
    "_id": "633842fbf55946fb0c4cc09a6",
    "createdAt": "1664631547736",
    "name": "Tag #6",
    "updatedAt": "1664631547736"
  }
]
interface Props {
  navigation: StackNavigationProp<MarketPlaceParamList>
}
export const CreatePostScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [tagLoading, setTagLoading] = useState(false)
  const tempPost = useSelector((state:RootState)=>state.storeReducer.tempPost)
  const [tag, setTag] = useState("")

  const [nameError, setNameError] = useState("")
  const [descriptionError, setDescriptionError] = useState("")
  const [filteredTags, setFilteredTags] = useState<MarketplaceTag[]>([])
  const [selectedTags, setSelectedTags] = useState<MarketplaceTag[]>([])
  const timeoutRef= React.useRef(null)
  const { t } = useTranslation()

  const isCorrectInput = () => {
    let nameValid = false
    let descriptionValid = false

    if (!name) setNameError(t("name_is_required"))
    else if (name?.length < 2) setNameError(t("name_must_be_more_than_2_characters"))
    else {
      nameValid = true
      setNameError("")
    }

    if (!description) setDescriptionError(t("description_is_required"))
    else if (description?.length < 2)
      setDescriptionError(t("description_must_be_more_than_2_characters"))
    else {
      descriptionValid = true
      setDescriptionError("")
    }

    return nameValid && descriptionValid ? true : false
  }
  const onNext = () => {
    if (!isCorrectInput()) return
    dispatch(setTempPost({ ...tempPost, name, description, tags: selectedTags }))
    navigation.navigate("AddImage")
  }
  const addTag = (item: MarketplaceTag) => {
    if(selectedTags.findIndex(tag=>tag.name===item.name)!==-1) return
    const newTags = [...selectedTags]
    if (newTags.length >= 5) newTags.pop()
    newTags.unshift(item)
    setSelectedTags(newTags)
  }
  const removeTag = (index: number) => {

    const newTags = [...selectedTags]
    newTags.splice(index, 1)
    setSelectedTags(newTags)
  }
  const debounceFindTags = (text: string) => {

    timeoutRef.current = setTimeout(() => {
      setTagLoading(true)
      autoCompleteTags(text).then(data => {
        setFilteredTags(data)
      }).finally(() => {
        setTagLoading(false)
      })
    }, 500)
  }
  const onChangeTags = (text: string) => {
    setTag(text)
    if (!text) {
      return clearTimeout(timeoutRef.current||0)
    }
    if (timeoutRef.current != null) {
      clearTimeout(timeoutRef.current)
      debounceFindTags(text)
    }else{
      debounceFindTags(text)
    }
  }

  React.useEffect(() => {
    const initData = () => {
      setIsLoading(true)
      getTags()
        .then(tags => setFilteredTags(tags))
        .finally(() => setIsLoading(false))

    }
    initData()
  }, [])
  return (
    <Screen
      style={styles.container}
      keyboardOffset={"none"}
    //  preset="scroll"
    >
      <HeaderComponent style={{ paddingHorizontal: 20, width }} />
      <View style={{ flex: 1 }}>
        <ScrollView>
          <TouchableOpacity
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
            onPress={() => {
              Keyboard.dismiss()
            }}
            activeOpacity={1}
          >
            <View style={GlobalStyles.center}>
              <Image
                source={images.backgroundSimple}
                style={{ width: 177, height: 158 }}
              />
              <Text style={styles.title}>{t("create_post")}</Text>
            </View>
            <View style={{ paddingHorizontal: 30, width: "100%" }}>
              <Text style={styles.labelStyle}>{t("name")}</Text>
              <TextInputComponent
                onChangeText={setName}
                value={name}
                placeholder={"Burger"}
                isError={nameError !== ""}
              />

              {nameError ? (
                <Text style={styles.errorText}>{nameError}</Text>
              ) : null}

              <Text style={styles.labelStyle}>{t("your_selected_tag")}</Text>
              <FlatList
                data={selectedTags}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item, index }) => {
                  return <TagComponent
                    title={item.name}
                    onClear={() => removeTag(index)}
                    disabled
                  />
                }}
                ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
                keyExtractor={(item, index) => item._id + '_' + index}
              />
              {selectedTags?.length>=5 ? (
                <Text style={styles.errorText}>{"You can select up to 5 tags."}</Text>
              ) : null}
              <TextInputComponent
                containerStyle={{ marginTop: selectedTags?.length ? 12 : 0 }}
                onChangeText={(text)=>onChangeTags(text)}
                value={tag}
                placeholder={t("enter_your_own_tags")}
                isError={false}
                
                rightComponent={() => {
                  const isTagNotFound = (tag && !tagLoading && !filteredTags?.length)
                  return isTagNotFound?<Text style={[styles.text, { color: palette.orange }]}
                  onPress={()=>{
                  addTag({...TemplateMarketPlaceTag, name: tag })
                  setTag('')
                  }}
                  >Add</Text>:null
                }}
              />
              <FlatList
                data={filteredTags}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={()=>{
                  if(tagLoading) return <ActivityIndicator color={palette.orange}/>
                  return tag?<Text>Can't find tag? Add your own</Text>:null
                }}
                renderItem={({ item }) => {
                  return <TagComponent
                  title={item.name}  
                  onPress={() => addTag(item)}
                />
                }}
                style={{ marginTop: 12 }}
                ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
                keyExtractor={item => item._id}
              />
              <Text style={styles.labelStyle}>{t("description")}</Text>
              <TextInputComponent
                placeholder={"Description ..."}
                textField={true}
                onChangeText={setDescription}
                value={description}
                isError={descriptionError !== ""}
              />
              {descriptionError ? (
                <Text style={styles.errorText}>{descriptionError}</Text>
              ) : null}
              <View style={{ alignItems: "flex-end", marginVertical: 15 }}>
                <TouchableOpacity style={styles.button} onPress={onNext}>
                  <Text style={[styles.text]}>{eng.next}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
      <LoadingComponent isLoading={isLoading} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  errorText: {
    fontFamily: typography.regular,
    fontSize: fontSize.font12,
    color: color.darkPink,
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
    marginTop: 10,
    marginBottom: 5
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
    backgroundColor: palette.orange,
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
    backgroundColor: palette.lighterGrey,
    alignItems: "center",
  },
})
