import { RouteProp, useIsFocused, useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { Button } from "@rneui/base"
import * as React from "react"
import { useState } from "react"
import { Dimensions, StyleSheet, Text, View } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import Carousel from "react-native-reanimated-carousel"
import Icon from "react-native-vector-icons/Ionicons"

import { PaginationItem } from "@app/components/pagination"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useSharedValue } from "react-native-reanimated"
import { Screen } from "../../components/screen"
import type { RootStackParamList } from "../../navigation/stack-param-lists"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import { SVGs } from "./earn-svg-factory"
import {
  augmentCardWithGqlData,
  getCardsFromSection,
  getQuizQuestionsContent,
} from "./earns-utils"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useQuizServer } from "../earns-map-screen/use-quiz-server"

const { width: screenWidth } = Dimensions.get("window")

export type QuizQuestion = {
  id: string
  title: string
  text: string
  question: string
  answers: string[]
  feedback: string[]
  amount: number
  completed: boolean
}

export type QuizQuestionContent = Omit<QuizQuestion, "amount" | "completed">

export type QuizQuestionForSectionScreen = QuizQuestion & {
  enabled: boolean
  nonEnabledMessage: string
}

export type QuizSectionContent = {
  section: {
    id: string
    title: string
  }
  content: QuizQuestionContent[]
}

const svgWidth = screenWidth

const styles = StyleSheet.create({
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

  buttonStyleFulfilled: {
    backgroundColor: color.transparent,
    borderRadius: 24,
    marginHorizontal: 60,
    marginVertical: 32,
  },

  icon: { paddingRight: 12, paddingTop: 3 },

  item: {
    backgroundColor: palette.lightBlue,
    borderRadius: 16,
    width: svgWidth,
  },

  itemTitle: {
    color: palette.white,
    fontSize: 20,
    fontWeight: "bold",
    height: 72,
    marginHorizontal: 24,
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

  titleStyleFulfilled: {
    color: palette.white,
  },

  unlock: {
    alignSelf: "center",
    color: palette.white,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },

  unlockQuestion: {
    alignSelf: "center",
    color: palette.white,
    fontSize: 16,
    paddingTop: 18,
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

const convertToQuizQuestionForSectionScreen = (
  cards: QuizQuestion[],
): QuizQuestionForSectionScreen[] => {
  let allPreviousFulfilled = true
  let nonEnabledMessage = ""

  return cards.map((card) => {
    const newCard = { ...card, enabled: allPreviousFulfilled, nonEnabledMessage }

    if (!newCard.completed && allPreviousFulfilled) {
      allPreviousFulfilled = false
      nonEnabledMessage = newCard.title
    }

    return newCard
  })
}

type Props = {
  route: RouteProp<RootStackParamList, "earnsSection">
}

export const EarnSection = ({ route }: Props) => {
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "earnsSection">>()

  const isAuthed = useIsAuthed()

  const { LL } = useI18nContext()
  const quizQuestionsContent = getQuizQuestionsContent({ LL })

  const { quizServerData } = useQuizServer()

  const section = route.params.section
  const cardsOnSection = getCardsFromSection({
    section,
    quizQuestionsContent,
  })

  const cards: QuizQuestionForSectionScreen[] = convertToQuizQuestionForSectionScreen(
    cardsOnSection.map((card) => augmentCardWithGqlData({ card, quizServerData })),
  )

  const itemIndex = cards.findIndex((item) => !item.completed)
  const [firstItem] = useState(itemIndex >= 0 ? itemIndex : 0)
  const progressValue = useSharedValue<number>(0)

  const isCompleted = cards.every((item) => item.completed)
  const [initialIsCompleted] = useState(isCompleted)

  const sectionTitle = LL.EarnScreen.earnSections[section].title()

  const isFocused = useIsFocused()

  if (initialIsCompleted === false && isCompleted && isFocused) {
    navigation.navigate("sectionCompleted", {
      amount: cards.reduce((acc, item) => item.amount + acc, 0),
      sectionTitle,
    })
  }

  React.useEffect(() => {
    navigation.setOptions({ title: sectionTitle })
  }, [navigation, sectionTitle])

  const open = async (id: string) => {
    // FIXME quick fix for apollo client refactoring
    if (!isAuthed) {
      navigation.navigate("phoneFlow")
      return
    }

    navigation.navigate("earnsQuiz", { id })
  }

  const CardItem = ({ item }: { item: QuizQuestionForSectionScreen }) => {
    return (
      <>
        <View style={styles.item}>
          <TouchableOpacity
            onPress={() => open(item.id)}
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
              onPress={() => open(item.id)}
              disabled={!item.enabled}
              disabledStyle={styles.buttonStyleDisabled}
              disabledTitleStyle={styles.titleStyleDisabled}
              buttonStyle={
                item.completed ? styles.buttonStyleFulfilled : styles.textButton
              }
              titleStyle={item.completed ? styles.titleStyleFulfilled : styles.titleStyle}
              title={
                item.completed
                  ? LL.EarnScreen.satsEarned({ formattedNumber: item.amount })
                  : LL.EarnScreen.earnSats({ formattedNumber: item.amount })
              }
              icon={
                item.completed ? (
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
            parallaxScrollingScale: 0.82,
            parallaxScrollingOffset: 80,
          }}
          onProgressChange={(_, absoluteProgress) =>
            (progressValue.value = absoluteProgress)
          }
        />
        {Boolean(progressValue) && (
          <View style={styles.paginationContainer}>
            {cards.map((_, index) => {
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
