import I18n from "i18n-js"
import { inject, observer } from "mobx-react"
import * as React from "react"
import { useState } from "react"
import { Alert, Dimensions, Platform, StyleSheet, Text, View } from "react-native"
import { Button } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { TouchableOpacity } from "react-native-gesture-handler"
import Carousel, { Pagination } from "react-native-snap-carousel"
import Icon from "react-native-vector-icons/Ionicons"
import { OnboardingEarn } from "types"
import { Screen } from "../../components/screen"
import { translate } from "../../i18n"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import { SVGs } from "./earn-svg-factory"
import { earnsMeta, getEarnFromSection, getRemainingSatsOnSection } from "./earns-utils"
import { useIsFocused } from '@react-navigation/native';


const { width: screenWidth } = Dimensions.get("window")
const { height: screenHeight } = Dimensions.get("window")

const svgWidth = screenWidth - 60

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
    width: svgWidth,
    borderRadius: 16,
    backgroundColor: palette.lightBlue
  },

  itemTitle: {
    $fontSize: 20,
    color: palette.white,
    fontSize: '$fontSize',
    fontWeight: "bold",
    textAlign: "center",
    marginHorizontal: "24rem",
    height: '3.6 * $fontSize',
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
    backgroundColor: palette.white,
    borderRadius: 24,
    marginHorizontal: 60,
    marginVertical: 32,
  },

  buttonStyleDisabled: {
    opacity: .5,
    backgroundColor: palette.white,
    borderRadius: 24,
    marginHorizontal: 60,
    marginVertical: 32,
  },

  buttonStyleFullfilled: {
    backgroundColor: color.transparent,
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

  titleStyleDisabled: {
    color: palette.lightBlue,
  },

  titleStyle: {
    color: palette.lightBlue,
    fontWeight: "bold"
  },

  unlockQuestion: {
    paddingTop: "18rem",
    color: palette.white,
    fontSize: "16rem",
    alignSelf: "center",
  },

  unlock: {
    color: palette.white,
    fontSize: "16rem",
    fontWeight: "bold",
    alignSelf: "center",
    textAlign: "center",
  },
})

export const EarnSection = inject("dataStore")(
  observer(({ dataStore, route, navigation }) => {

    const sectionIndex = route.params.section
    console.tron.log({earnSection: sectionIndex})
    const cards = getEarnFromSection({ sectionIndex, earnsMeta, dataStore })

    const itemIndex = cards.findIndex(item => !item.fullfilled)
    const [firstItem] = useState(itemIndex >= 0 ? itemIndex : 0)

    const [currRewardIndex, setCurrRewardIndex] = useState(firstItem)

    const [initialRemainingSats] = useState(getRemainingSatsOnSection({ sectionIndex, dataStore }))
    const currentRemainingEarn = getRemainingSatsOnSection({ sectionIndex, dataStore })
    
    const sectionTitle = translate(`EarnScreen.earns\.${sectionIndex}\.meta.title`)

    const isFocused = useIsFocused()
    console.tron.log({isFocused, initialRemainingSats, currentRemainingEarn})

    if (initialRemainingSats !== 0 && currentRemainingEarn === 0 && isFocused) {
      console.tron.warn("section Completed!")
      navigation.navigate("sectionCompleted", {
        amount: cards.reduce((acc, item) => OnboardingEarn[item.id] + acc, 0),
        sectionTitle
    })}

    navigation.setOptions({ title: sectionTitle })
    
    enum RewardType {
      Text = "Text",
      Video = "Video",
      Action = "Action",
    }

    const open = async (card) => {

      switch (RewardType[card.type]) {
        case RewardType.Text:
          navigation.navigate('earnsQuiz', { 
            title: card.title, 
            text: card.text, 
            amount: OnboardingEarn[card.id],
            question: card.question,
            answers: card.answers, 
            feedback: card.feedback,
            onComplete: () => earnsMeta[card.id].onComplete({ dataStore }),
            id: card.id,
            completed: dataStore.onboarding.has(card.id)
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
        <>
          <View style={styles.item}>
            <TouchableOpacity 
              onPress={() => open(item)}
              activeOpacity={0.9}
              disabled={!item.enabled}
              >
              {SVGs({name: item.id, width: svgWidth})}
            </TouchableOpacity>
            <View>
              <Text 
                style={styles.itemTitle}
                numberOfLines={3}  
              >{item.title}</Text>
              <Button
                onPress={() => open(item)}
                disabled={!item.enabled}
                disabledStyle={styles.buttonStyleDisabled}
                disabledTitleStyle={styles.titleStyleDisabled}
                buttonStyle={item.fullfilled ? styles.buttonStyleFullfilled : styles.textButton}
                titleStyle={item.fullfilled ? styles.titleStyleFullfilled : styles.titleStyle}
                title={
                    // item.enabled
                    // ?
                    item.fullfilled
                      ? I18n.t("EarnScreen.satsEarned", {
                          count: OnboardingEarn[item.id],
                          formatted_number: I18n.toNumber(OnboardingEarn[item.id], { precision: 0 }),
                        })
                      : I18n.t("EarnScreen.earnSats", {
                          count: OnboardingEarn[item.id],
                          formatted_number: I18n.toNumber(OnboardingEarn[item.id], { precision: 0 }),
                        })
                      // : translate("common.learnMore")
                    // : 
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
          {!item.enabled &&
            <>
              <Text style={styles.unlockQuestion}>To unlock, answer the question:</Text>
              <Text style={styles.unlock}>{item.enabledMessage}</Text>
            </>
          }
        </>
      )
    }

    return (
      <Screen style={styles.screenStyle}>
        <View style={{ flex: 1 }} />
        <Carousel
          data={cards}
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
          dotsLength={cards.length}
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
