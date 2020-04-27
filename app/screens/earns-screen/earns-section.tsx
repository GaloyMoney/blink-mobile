import I18n from "i18n-js"
import { inject, observer } from "mobx-react"
import * as React from "react"
import { useState } from "react"
import { Alert, Dimensions, Image, Platform, StyleSheet, Text, View } from "react-native"
import { Button } from "react-native-elements"
import { TouchableOpacity } from "react-native-gesture-handler"
import Carousel, { Pagination } from "react-native-snap-carousel"
import Icon from "react-native-vector-icons/Ionicons"
import { OnboardingEarn } from "types"
import { Screen } from "../../components/screen"
import { translate } from "../../i18n"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import { getRemainingEarnSats, getEarnFromSection, earnsMeta } from "./earns-utils"
import { SVGs } from "./earn-svg-factory"
import { CurrencyType } from "../../utils/enum"
import EStyleSheet from "react-native-extended-stylesheet"


const { width: screenWidth } = Dimensions.get("window")
const { height: screenHeight } = Dimensions.get("window")

const styles = EStyleSheet.create({
  screenStyle: {
    backgroundColor: palette.blue
  },

  accountView: {
    borderColor: color.line,
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: 15,
    marginHorizontal: 15,
    padding: 6,
  },

  header: {
    alignItems: "center",
    marginVertical: 10,
  },

  image: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: "cover",
  },

  imageContainerEarn: {
    height: 200,
    marginBottom: Platform.select({ ios: 0, android: 1 }), // Prevent a random Android rendering issue
    backgroundColor: palette.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },

  item: {
    width: screenWidth - 60,
    // height: screenWidth - 90,
    borderRadius: 16,
    backgroundColor: palette.lightBlue
  },

  itemTitle: {
    color: palette.white,
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 12,
    textAlign: "center",
    marginHorizontal: "24rem"
  },

  satsButton: {
    color: palette.white,
    fontSize: 18,
    textAlign: "center",
  },

  smallText: {
    color: palette.white,
    fontSize: 18,
    marginBottom: 40,
    marginHorizontal: 40,
    textAlign: "center",
  },

  text: {
    color: palette.white,
    fontSize: 22,
    marginHorizontal: 20,
    textAlign: "center",
  },

  textButton: {
    backgroundColor: color.primary,
    borderRadius: 24,
    marginHorizontal: 60,
    marginVertical: 32,
  },

  buttonStyleFullfilled: {
    // backgroundColor: palette.offWhite,
    borderRadius: 24,
    marginHorizontal: 60,
    marginVertical: 32,
  },

  textButtonClose: {
    backgroundColor: palette.darkGrey,
    marginTop: 10,
    paddingHorizontal: 60,
  },

  title: {
    color: palette.darkGrey,
    fontWeight: "bold",
    marginHorizontal: 40,
    textAlign: "center",
  },

  titleSats: {
    color: color.primary,
    fontSize: 32,
    fontWeight: "bold",
    marginHorizontal: 40,
    textAlign: "center",
  },

  titleStyleFullfilled: {
    color: palette.white,
  },
})

export const EarnSection = inject("dataStore")(
  observer(({ dataStore, route, navigation }) => {

    const section = route.params.section
    const earn = getEarnFromSection({ section, earnsMeta, dataStore })

    const itemIndex = earn.findIndex(item => !item.fullfilled)
    const [firstItem] = useState(itemIndex >= 0 ? itemIndex : 0)

    const [currRewardIndex, setCurrRewardIndex] = useState(firstItem)

    const [initialRemainingEarn] = useState(getRemainingEarnSats({ section, dataStore }))
    const currentRemainingEarn = getRemainingEarnSats({ section, dataStore })

    if (initialRemainingEarn !== 0 && currentRemainingEarn === 0) {
      Alert.alert("You have succesfully completed this section!", "", [
        {
          text: translate("common.ok"),
          onPress: () => {
            navigation.goBack()
          },
        },
      ])
    }
    
    navigation.setOptions({ title: translate(`EarnScreen.earns\.${section}\.meta.title`) })
    
    enum RewardType {
      Text = "Text",
      Video = "Video",
      Action = "Action",
    }

    const open = async (earn) => {

      switch (RewardType[earn.type]) {
        case RewardType.Text:
          navigation.navigate('earnsQuiz', { 
            title: earn.title, 
            text: earn.text, 
            amount: OnboardingEarn[earn.id],
            question: earn.question,
            answers: earn.answers, 
            feedback: earn.feedback,
            onComplete: () => earnsMeta[earn.id].onComplete({ dataStore }),
            id: earn.id,
            completed: dataStore.onboarding.has(earn.id)
          })
          break
        //     case RewardType.Video:
        //       try {
        //         console.tron.log({ videoid: earns.videoid })
        //         await YouTubeStandaloneIOS.playVideo(earns.videoid)
        //         await sleep(500) // FIXME why await for playVideo doesn't work?
        //         console.tron.log("finish video")
        //         setQuizVisible(true)
        //       } catch (err) {
        //         console.tron.log("error video", err.toString())
        //         setQuizVisible(false)
        //       }
        //       break
        case RewardType.Action:
          // TODO
          // await earnsMeta[earns.id].onAction({ dataStore, navigate })
          break
      }
    }

    const CardItem = ({ item, index }) => {
      console.tron.log({item})

      return (
        <View style={styles.item}>
          <TouchableOpacity 
            onPress={() => open(item)}
            activeOpacity={0.9}
            >
            {SVGs({name: item.id})}
            {/* <Image
              source={eval(`${item.id}Image`)} // FIXME
              style={{width: screenWidth - 60, height: 300, resizeMode: 'contain'}}
              containerStyle={styles.imageContainerEarn}
            /> */}
          </TouchableOpacity>
          <View>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Button
              onPress={() => open(item)}
              disabled={!item.enabled}
              type={item.fullfilled ? "clear" : "solid"}
              buttonStyle={item.fullfilled ? styles.buttonStyleFullfilled : styles.textButton}
              titleStyle={item.fullfilled ? styles.titleStyleFullfilled : null}
              // containerStyle={styles.}
              title={
                  item.enabled
                  ? item.fullfilled
                    ? I18n.t("EarnScreen.satsEarned", {
                      count: OnboardingEarn[item.id],
                      formatted_number: I18n.toNumber(OnboardingEarn[item.id], { precision: 0 }),
                    })
                    : I18n.t("EarnScreen.earnSats", {
                        count: OnboardingEarn[item.id],
                        formatted_number: I18n.toNumber(OnboardingEarn[item.id], { precision: 0 }),
                      })
                    // : translate("common.learnMore")
                  : item.enabledMessage
              }
              icon={item.fullfilled ? <Icon 
                name={"ios-checkmark-circle-outline"}
                size={36}
                color={palette.white}
                style={{paddingRight: 12, paddingTop: 3}}
                />
                : undefined}
            />
          </View>
        </View>
      )
    }

    return (
      <Screen style={styles.screenStyle}>
        <View style={{ flex: 1 }} />
        <Carousel
          data={earn}
          renderItem={CardItem}
          sliderWidth={screenWidth}
          // scrollEnabled={!isRewardOpen}
          itemWidth={screenWidth - 60}
          hasParallaxImages={true}
          firstItem={firstItem}
          // inactiveSlideOpacity={isRewardOpen ? 0 : 0.7}
          removeClippedSubviews={false}
          onBeforeSnapToItem={(index) => setCurrRewardIndex(index)}
        />
        <View style={{ flex: 1 }} />
        <Pagination
          dotsLength={earn.length}
          activeDotIndex={currRewardIndex}
          dotStyle={{
              width: 10,
              height: 10,
              borderRadius: 5,
              marginHorizontal: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.92)'
          }}
          inactiveDotStyle={{
              // Define styles for inactive dots here
          }}
          inactiveDotOpacity={0.4}
          inactiveDotScale={0.6}
        />
      </Screen>
    )
  }),
)
