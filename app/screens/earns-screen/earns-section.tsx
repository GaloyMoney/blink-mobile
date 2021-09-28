import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client"
import { RouteProp, useIsFocused } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import I18n from "i18n-js"
import * as React from "react"
import { useState } from "react"
import { Dimensions, Text, View } from "react-native"
import { Button } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { TouchableOpacity } from "react-native-gesture-handler"
import Carousel, { Pagination } from "react-native-snap-carousel"
import Icon from "react-native-vector-icons/Ionicons"
import { Screen } from "../../components/screen"
import { QUERY_TRANSACTIONS, QUERY_EARN_LIST } from "../../graphql/query"
import { translate } from "../../i18n"
import type { RootStackParamList } from "../../navigation/stack-param-lists"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import type { QuizQuestion } from "../../types/quiz"
import type { ScreenType } from "../../types/jsx"
import { Token } from "../../utils/token"
import { SVGs } from "./earn-svg-factory"
import { getCardsFromSection, remainingSatsOnSection } from "./earns-utils"

const { width: screenWidth } = Dimensions.get("window")

const svgWidth = screenWidth - 60

const styles = EStyleSheet.create({
  buttonStyleDisabled: {
    backgroundColor: palette.white,
    borderRadius: 24,
    marginHorizontal: 60,
    marginVertical: 32,
    opacity: 0.5,
  },

  buttonStyleFullfilled: {
    backgroundColor: color.transparent,
    borderRadius: 24,
    marginHorizontal: 60,
    marginVertical: 32,
  },

  divider: { flex: 1 },

  // eslint-disable-next-line react-native/no-color-literals
  dot: {
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderRadius: 5,
    height: 10,
    marginHorizontal: 0,
    width: 10,
  },

  icon: { paddingRight: 12, paddingTop: 3 },

  item: {
    backgroundColor: palette.lightBlue,
    borderRadius: 16,
    width: svgWidth,
  },

  itemTitle: {
    $fontSize: 20,
    color: palette.white,
    fontSize: "$fontSize",
    fontWeight: "bold",
    height: "3.6 * $fontSize",
    marginHorizontal: "24rem",
    textAlign: "center",
  },

  svgContainer: { paddingVertical: 12 },

  textButton: {
    backgroundColor: palette.white,
    borderRadius: 24,
    marginHorizontal: 60,
    marginVertical: 32,
  },

  titleStyle: {
    color: palette.lightBlue,
    fontWeight: "bold",
  },

  titleStyleDisabled: {
    color: palette.lightBlue,
  },

  titleStyleFullfilled: {
    color: palette.white,
  },

  unlock: {
    alignSelf: "center",
    color: palette.white,
    fontSize: "16rem",
    fontWeight: "bold",
    textAlign: "center",
  },

  unlockQuestion: {
    alignSelf: "center",
    color: palette.white,
    fontSize: "16rem",
    paddingTop: "18rem",
  },
})

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "earnsSection">
  route: RouteProp<RootStackParamList, "earnsSection">
}

export const EarnSection: ScreenType = ({ route, navigation }: Props) => {
  const [queryTransactions] = useLazyQuery(QUERY_TRANSACTIONS, {
    fetchPolicy: "network-only",
  })

  const [earnCompleted] = useMutation(gql`
    mutation earnCompleted($ids: [ID]) {
      earnCompleted(ids: $ids) {
        id
        value
        completed
      }
    }
  `)

  // TODO: fragment with earnList
  const { data } = useQuery(QUERY_EARN_LIST, {
    variables: {
      logged: Token.getInstance().has(),
    },
    fetchPolicy: "cache-only",
  })

  const { earnList } = data

  const sectionIndex = route.params.section
  const cards = getCardsFromSection({ sectionIndex, earnList })

  const itemIndex = cards.findIndex((item) => !item.fullfilled)
  const [firstItem] = useState(itemIndex >= 0 ? itemIndex : 0)
  const [currRewardIndex, setCurrRewardIndex] = useState(firstItem)

  const remainingSats = remainingSatsOnSection({ sectionIndex, earnList })

  const [initialRemainingSats] = useState(remainingSats)
  const currentRemainingEarn = remainingSats

  const sectionTitle = translate(`EarnScreen.earns.${sectionIndex}.meta.title`)

  const isFocused = useIsFocused()

  if (!data) {
    return null
  }

  if (initialRemainingSats !== 0 && currentRemainingEarn === 0 && isFocused) {
    navigation.navigate("sectionCompleted", {
      amount: cards.reduce((acc, item) => item.value + acc, 0),
      sectionTitle,
    })
  }

  navigation.setOptions({ title: sectionTitle })

  enum RewardType {
    Text = "Text",
    Video = "Video",
    Action = "Action",
  }

  const open = async (card) => {
    // FIXME quick fix for apollo client refactoring
    if (!Token.getInstance().has()) {
      navigation.navigate("phoneValidation")
      return
    }

    switch (RewardType[card.type]) {
      case RewardType.Text:
        navigation.navigate("earnsQuiz", {
          title: card.title,
          text: card.text,
          amount: card.value,
          question: card.question,
          answers: card.answers,
          feedback: card.feedback,
          // store.earnComplete(card.id),
          onComplete: async () => {
            // eslint-disable-next-line no-sequences
            await earnCompleted({ variables: { ids: [card.id] } }), queryTransactions()
          },
          id: card.id,
          completed: earnList.find((item) => item.id == card.id).completed,
        })
        break
      //     case RewardType.Video:
      //       try {
      //         console.log({ videoid: earns.videoid })
      //         await YouTubeStandaloneIOS.playVideo(earns.videoid)
      //         await sleep(500) // FIXME why await for playVideo doesn't work?
      //         console.log("finish video")
      //         setQuizVisible(true)
      //       } catch (err) {
      //         console.log("error video", err.toString())
      //         setQuizVisible(false)
      //       }
      //       break
      case RewardType.Action:
        // TODO
        break
    }
  }

  const CardItem = ({ item }: { item: QuizQuestion }) => {
    return (
      <>
        <View style={styles.item}>
          <TouchableOpacity
            onPress={() => open(item)}
            activeOpacity={0.9}
            disabled={!item.enabled}
          >
            <View style={styles.svgContainer}>
              {SVGs({ name: item.id, width: svgWidth })}
            </View>
          </TouchableOpacity>
          <View>
            <Text style={styles.itemTitle} numberOfLines={3}>
              {item.title}
            </Text>
            <Button
              onPress={() => open(item)}
              disabled={!item.enabled}
              disabledStyle={styles.buttonStyleDisabled}
              disabledTitleStyle={styles.titleStyleDisabled}
              buttonStyle={
                item.fullfilled ? styles.buttonStyleFullfilled : styles.textButton
              }
              titleStyle={
                item.fullfilled ? styles.titleStyleFullfilled : styles.titleStyle
              }
              title={I18n.t(
                item.fullfilled ? "EarnScreen.satsEarned" : "EarnScreen.earnSats",
                {
                  count: item.value,
                  formatted_number: I18n.toNumber(item.value, { precision: 0 }),
                },
              )}
              icon={
                item.fullfilled ? (
                  <Icon
                    name="ios-checkmark-circle-outline"
                    size={36}
                    color={palette.white}
                    style={styles.icon}
                  />
                ) : undefined
              }
            />
          </View>
        </View>
        {!item.enabled && (
          <>
            <Text style={styles.unlockQuestion}>
              {translate("EarnScreen.unlockQuestion")}
            </Text>
            <Text style={styles.unlock}>{item.nonEnabledMessage}</Text>
          </>
        )}
      </>
    )
  }

  return (
    <Screen backgroundColor={palette.blue} statusBar="light-content">
      <View style={styles.divider} />
      <Carousel
        data={cards}
        renderItem={CardItem}
        sliderWidth={screenWidth}
        // scrollEnabled={!isRewardOpen}
        itemWidth={screenWidth - 60}
        hasParallaxImages
        firstItem={firstItem}
        // inactiveSlideOpacity={isRewardOpen ? 0 : 0.7}
        removeClippedSubviews={false}
        onBeforeSnapToItem={(index) => setCurrRewardIndex(index)}
      />
      <View style={styles.divider} />
      <Pagination
        dotsLength={cards.length}
        activeDotIndex={currRewardIndex}
        dotStyle={styles.dot}
        inactiveDotStyle={
          {
            // Define styles for inactive dots here
          }
        }
        inactiveDotOpacity={0.4}
        inactiveDotScale={0.6}
      />
    </Screen>
  )
}
