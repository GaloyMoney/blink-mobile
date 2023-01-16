import { gql, useApolloClient } from "@apollo/client"
import { RouteProp, useIsFocused } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
import { useState } from "react"
import { Dimensions, Text, View } from "react-native"
import { Button } from "@rneui/base"
import EStyleSheet from "react-native-extended-stylesheet"
import { TouchableOpacity } from "react-native-gesture-handler"
import Carousel from "react-native-reanimated-carousel"
import Icon from "react-native-vector-icons/Ionicons"

import { Screen } from "../../components/screen"
import type { RootStackParamList } from "../../navigation/stack-param-lists"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import type { QuizQuestion } from "../../types/quiz"
import type { ScreenType } from "../../types/jsx"
import useToken from "../../hooks/use-token"
import { toastShow } from "../../utils/toast"
import { SVGs } from "./earn-svg-factory"
import {
  getCardsFromSection,
  getQuizQuestionsContent,
  remainingSatsOnSection,
} from "./earns-utils"
import { getQuizQuestions } from "./query"
import { useI18nContext } from "@app/i18n/i18n-react"
import { earnSections } from "./sections"
import { PaginationItem } from "@app/components/pagination"
import { useSharedValue } from "react-native-reanimated"
import { joinErrorsMessages } from "@app/graphql/utils"
import { useUserQuizQuestionUpdateCompletedMutation } from "@app/graphql/generated"

const { width: screenWidth } = Dimensions.get("window")

const svgWidth = screenWidth - 60

const styles = EStyleSheet.create({
  container: {
    alignItems: "center",
  },
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

  // eslint-disable-next-line react-native/no-color-literals
  // dot: {
  //   backgroundColor: "rgba(255, 255, 255, 0.92)",
  //   borderRadius: 5,
  //   height: 10,
  //   marginHorizontal: 0,
  //   width: 10,
  // },

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
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 100,
    alignSelf: "center",
    position: "absolute",
    bottom: 40,
  },
})

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "earnsSection">
  route: RouteProp<RootStackParamList, "earnsSection">
}

gql`
  mutation userQuizQuestionUpdateCompleted(
    $input: UserQuizQuestionUpdateCompletedInput!
  ) {
    userQuizQuestionUpdateCompleted(input: $input) {
      errors {
        __typename
        message
      }
      userQuizQuestion {
        question {
          id
          earnAmount
        }
        completed
      }
    }
  }
`

export const EarnSection: ScreenType = ({ route, navigation }: Props) => {
  const { hasToken } = useToken()
  const client = useApolloClient()
  const { LL } = useI18nContext()

  const [userQuizQuestionUpdateCompleted] = useUserQuizQuestionUpdateCompletedMutation({
    onCompleted: () => {
      client.refetchQueries({
        include: ["main"],
      })
    },
  })

  const quizQuestions = getQuizQuestions(client, { hasToken })

  const quizQuestionsContent = getQuizQuestionsContent({ LL })

  const sectionIndex = route.params.section
  const cards = getCardsFromSection({ quizQuestions, sectionIndex, quizQuestionsContent })

  const itemIndex = cards.findIndex((item) => !item.fullfilled)
  const [firstItem] = useState(itemIndex >= 0 ? itemIndex : 0)
  const progressValue = useSharedValue<number>(0)
  const remainingSats = remainingSatsOnSection({
    quizQuestions,
    sectionIndex,
    quizQuestionsContent,
  })

  const [initialRemainingSats] = useState(remainingSats)
  const currentRemainingEarn = remainingSats

  const sectionTitle =
    LL.EarnScreen.earnSections[Object.keys(earnSections)[sectionIndex]].meta.title()

  const isFocused = useIsFocused()

  if (initialRemainingSats !== 0 && currentRemainingEarn === 0 && isFocused) {
    navigation.navigate("sectionCompleted", {
      amount: cards.reduce((acc, item) => item.value + acc, 0),
      sectionTitle,
    })
  }

  React.useEffect(() => {
    navigation.setOptions({ title: sectionTitle })
  }, [navigation, sectionTitle])

  enum RewardType {
    Text = "Text",
    Video = "Video",
    Action = "Action",
  }

  const open = async (card) => {
    // FIXME quick fix for apollo client refactoring
    if (!hasToken) {
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
            const { errors } = await userQuizQuestionUpdateCompleted({
              variables: { input: { id: card.id } },
            })
            if (errors.length) {
              toastShow({ message: joinErrorsMessages(errors) })
            }
          },
          id: card.id,
          completed: Boolean(quizQuestions.myCompletedQuestions[card.id]),
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
              title={
                item.fullfilled
                  ? LL.EarnScreen.satsEarned({ formattedNumber: item.value })
                  : LL.EarnScreen.earnSats({ formattedNumber: item.value })
              }
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
            <Text style={styles.unlockQuestion}>{LL.EarnScreen.unlockQuestion()}</Text>
            <Text style={styles.unlock}>{item.nonEnabledMessage}</Text>
          </>
        )}
      </>
    )
  }

  return (
    <Screen backgroundColor={palette.blue} statusBar="light-content">
      <View style={styles.container}>
        <Carousel
          data={cards}
          renderItem={CardItem}
          width={screenWidth}
          mode="parallax"
          defaultIndex={firstItem}
          loop={false}
          modeConfig={{
            parallaxScrollingScale: 0.9,
            parallaxScrollingOffset: 50,
          }}
          onProgressChange={(_, absoluteProgress) =>
            (progressValue.value = absoluteProgress)
          }
        />
        {Boolean(progressValue) && (
          <View style={styles.paginationContainer}>
            {cards.map((card, index) => {
              return (
                <PaginationItem
                  backgroundColor={"grey"}
                  animValue={progressValue}
                  index={index}
                  key={index}
                  length={cards.length}
                />
              )
            })}
          </View>
        )}
      </View>
    </Screen>
  )
}
