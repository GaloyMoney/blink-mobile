/* eslint-disable react-native/no-inline-styles */
import { Button } from "@rneui/base"
import * as React from "react"
import { useEffect, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { ScrollView, TouchableWithoutFeedback } from "react-native-gesture-handler"
import Modal from "react-native-modal"
import { SafeAreaView } from "react-native-safe-area-context"
import Icon from "react-native-vector-icons/Ionicons"

import { gql } from "@apollo/client"
import { useQuizCompletedMutation } from "@app/graphql/generated"
import { getErrorMessages } from "@app/graphql/utils"
import { useI18nContext } from "@app/i18n/i18n-react"
import { toastShow } from "@app/utils/toast"
import { RouteProp, useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { CloseCross } from "../../components/close-cross"
import { Screen } from "../../components/screen"
import type { RootStackParamList } from "../../navigation/stack-param-lists"
import { palette } from "../../theme/palette"
import { shuffle } from "../../utils/helper"
import { sleep } from "../../utils/sleep"
import { SVGs } from "./earn-svg-factory"
import { augmentCardWithGqlData, getQuizQuestionsContent } from "./earns-utils"
import { useQuizServer } from "../earns-map-screen/use-quiz-server"

const styles = StyleSheet.create({
  answersView: {
    flex: 1,
    marginHorizontal: 48,
    marginTop: 6,
  },

  bottomContainer: {
    alignItems: "center",
    backgroundColor: palette.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 0,
    shadowColor: palette.midGrey,
    shadowOpacity: 5,
    shadowRadius: 8,
  },

  buttonStyle: {
    backgroundColor: palette.lightBlue,
    borderRadius: 32,
    width: 224,
  },

  completedTitleStyle: {
    color: palette.lightBlue,
    fontSize: 18,
    fontWeight: "bold",
  },

  correctAnswerText: {
    color: palette.green,
    fontSize: 16,
  },

  incorrectAnswerText: {
    color: palette.red,
    fontSize: 16,
  },

  keepDiggingContainerStyle: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    marginTop: 18,
    minHeight: 18,
  },

  modalBackground: {
    alignItems: "center",
    backgroundColor: palette.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    justifyContent: "flex-end",
    minHeight: 630,
    // flexGrow: 1,
  },

  quizButtonContainerStyle: {
    marginVertical: 12,
    width: 48,
  },

  quizButtonStyle: {
    backgroundColor: palette.lightBlue,
    borderRadius: 32,
    padding: 12,
  },

  quizButtonTitleStyle: {
    color: palette.white,
    fontWeight: "bold",
  },

  quizCorrectButtonStyle: {
    backgroundColor: palette.green,
    borderRadius: 32,
    padding: 12,
  },

  quizTextAnswer: {
    color: palette.darkGrey,
    textAlign: "left",
    // fontWeight: "bold"
    // fontSize: 18,
    width: "100%",
  },

  quizTextContainerStyle: {
    alignItems: "flex-start",
    marginLeft: 12,
    marginRight: 36,
  },

  quizWrongButtonStyle: {
    backgroundColor: palette.red,
    borderRadius: 32,
    padding: 12,
  },

  svgContainer: {
    alignItems: "center",
    paddingVertical: 16,
  },

  text: {
    fontSize: 24,
  },

  textContainer: {
    marginHorizontal: 24,
    paddingBottom: 48,
  },

  textEarn: {
    color: palette.darkGrey,
    fontSize: 16,
    fontWeight: "bold",
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    paddingBottom: 12,
  },

  titleStyle: {
    color: palette.white,
    fontSize: 18,
    fontWeight: "bold",
  },
})

const mappingLetter = { 0: "A", 1: "B", 2: "C" }

type Props = {
  route: RouteProp<RootStackParamList, "earnsQuiz">
}

gql`
  mutation quizCompleted($input: QuizCompletedInput!) {
    quizCompleted(input: $input) {
      errors {
        message
      }
      quiz {
        id
        completed
      }
    }
  }
`

export const EarnQuiz = ({ route }: Props) => {
  const { LL } = useI18nContext()
  const quizQuestionsContent = getQuizQuestionsContent({ LL })
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, "earnsQuiz">>()

  const [permutation] = useState<ZeroTo2[]>(shuffle([0, 1, 2]))

  const { quizServerData } = useQuizServer()

  const { id } = route.params

  const allCards = React.useMemo(
    () => quizQuestionsContent.map((item) => item.content).flatMap((item) => item),
    [quizQuestionsContent],
  )

  const cardNoMetadata = React.useMemo(
    () => allCards.find((item) => item.id === id),
    [allCards, id],
  )

  if (!cardNoMetadata) {
    // should never happen
    throw new Error("card not found")
  }

  const card = augmentCardWithGqlData({ card: cardNoMetadata, quizServerData })
  const { title, text, amount, answers, feedback, question, completed } = card

  const [quizCompleted] = useQuizCompletedMutation()
  const [quizVisible, setQuizVisible] = useState(false)
  const [recordedAnswer, setRecordedAnswer] = useState<number[]>([])

  const addRecordedAnswer = (value: number) => {
    setRecordedAnswer([...recordedAnswer, value])
  }

  const answersShuffled: Array<React.ReactNode> = []

  useEffect(() => {
    ;(async () => {
      if (recordedAnswer.indexOf(0) !== -1) {
        const { data } = await quizCompleted({
          variables: { input: { id } },
        })
        if (data?.quizCompleted?.errors?.length) {
          // FIXME: message is hidden by the modal
          toastShow({
            message: getErrorMessages(data.quizCompleted.errors),
          })
        }
      }
    })()
  }, [recordedAnswer, id, quizCompleted])

  const close = async () => {
    if (quizVisible) {
      setQuizVisible(false)
      await sleep(100)
    }
    navigation.goBack()
  }

  type ZeroTo2 = 0 | 1 | 2

  const buttonStyleHelper = (i: ZeroTo2) => {
    return recordedAnswer.indexOf(i) === -1
      ? styles.quizButtonStyle
      : i === 0
      ? styles.quizCorrectButtonStyle
      : styles.quizWrongButtonStyle
  }

  let j: ZeroTo2 = 0
  permutation.forEach((i) => {
    answersShuffled.push(
      <View key={i} style={{ width: "100%" }}>
        <View style={{ flexDirection: "row", alignItems: "center", width: "100%" }}>
          <Button
            title={mappingLetter[j]}
            buttonStyle={buttonStyleHelper(i)}
            disabledStyle={buttonStyleHelper(i)}
            titleStyle={styles.quizButtonTitleStyle}
            disabledTitleStyle={styles.quizButtonTitleStyle}
            containerStyle={styles.quizButtonContainerStyle}
            onPress={() => addRecordedAnswer(i)}
            disabled={recordedAnswer.indexOf(0) !== -1}
          />
          <Button
            title={answers[i]}
            titleStyle={styles.quizTextAnswer}
            disabledTitleStyle={styles.quizTextAnswer}
            containerStyle={styles.quizTextContainerStyle}
            // disabledStyle={styles.quizTextContainerStyle}
            type="clear"
            onPress={() => addRecordedAnswer(i)}
            disabled={recordedAnswer.indexOf(0) !== -1}
          />
        </View>
        {recordedAnswer.length > 0 &&
        recordedAnswer.indexOf(i) === recordedAnswer.length - 1 ? (
          <Text style={i === 0 ? styles.correctAnswerText : styles.incorrectAnswerText}>
            {feedback[i]}
          </Text>
        ) : null}
      </View>,
    )
    j = (j + 1) as ZeroTo2
  })

  return (
    <Screen backgroundColor={palette.lighterGrey} unsafe>
      <Modal
        style={{ marginHorizontal: 0, marginBottom: 0, flexGrow: 1 }}
        isVisible={quizVisible}
        swipeDirection={quizVisible ? ["down"] : ["up"]}
        onSwipeComplete={() => setQuizVisible(false)}
        swipeThreshold={50}
        propagateSwipe
      >
        {/* TODO: expand automatically */}
        <View style={{ flexShrink: 1 }}>
          <TouchableWithoutFeedback onPress={() => setQuizVisible(false)}>
            <View style={{ height: "100%", width: "100%" }} />
          </TouchableWithoutFeedback>
        </View>
        <View style={styles.modalBackground}>
          <View style={{ height: 14 }}>
            <Icon
              name="ios-remove"
              size={72}
              color={palette.lightGrey}
              style={{ height: 40, top: -30 }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.answersView}>
              <Text style={styles.title}>{question ?? title}</Text>
              {answersShuffled}
            </View>
            <View>
              {recordedAnswer.indexOf(0) === -1 ? null : (
                <Button
                  title={LL.EarnScreen.keepDigging()}
                  type="outline"
                  onPress={async () => close()}
                  containerStyle={styles.keepDiggingContainerStyle}
                  buttonStyle={styles.buttonStyle}
                  titleStyle={styles.titleStyle}
                />
              )}
            </View>
          </View>
        </View>
      </Modal>
      <SafeAreaView style={{ flex: 1, paddingBottom: 0 }}>
        <ScrollView persistentScrollbar showsVerticalScrollIndicator bounces>
          <View style={styles.svgContainer}>{SVGs({ name: id, theme: "dark" })}</View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.text}>{text}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
      <CloseCross onPress={async () => close()} color={palette.darkGrey} />
      <SafeAreaView style={styles.bottomContainer}>
        <View style={{ paddingVertical: 12 }}>
          {(completed && (
            <>
              <Text style={styles.textEarn}>
                {LL.EarnScreen.quizComplete({ amount })}
              </Text>
              <Button
                title={LL.EarnScreen.reviewQuiz()}
                type="clear"
                titleStyle={styles.completedTitleStyle}
                onPress={() => setQuizVisible(true)}
              />
            </>
          )) || (
            <Button
              title={LL.EarnScreen.earnSats({
                formattedNumber: amount,
              })}
              buttonStyle={styles.buttonStyle}
              titleStyle={styles.titleStyle}
              onPress={() => setQuizVisible(true)}
            />
          )}
        </View>
      </SafeAreaView>
    </Screen>
  )
}
