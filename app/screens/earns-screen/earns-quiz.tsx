import * as React from "react"
import { useEffect, useState } from "react"
import { Text, View } from "react-native"
import { Button } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { ScrollView, TouchableWithoutFeedback } from "react-native-gesture-handler"
import Modal from "react-native-modal"
import Icon from "react-native-vector-icons/Ionicons"
import { CloseCross } from "../../components/close-cross"
import { Screen } from "../../components/screen"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import { shuffle } from "../../utils/helper"
import { sleep } from "../../utils/sleep"
import { SVGs } from "./earn-svg-factory"
import { SafeAreaView } from "react-native-safe-area-context"

const styles = EStyleSheet.create({

  svgContainer: {
    alignItems: "center",
  },

  textContainer: {
    marginHorizontal: 24,
    paddingVertical: 48,
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    paddingVertical: 12,
  },

  text: {
    fontSize: 24,
  },

  textEarn: {
    fontSize: "16rem",
    color: palette.darkGrey,
    fontWeight: "bold",
  },

  bottomContainer: {
    backgroundColor: palette.white,
    borderTopLeftRadius: "24rem",
    borderTopRightRadius: "24rem",
    shadowColor: palette.midGrey,
    shadowOpacity: 5,
    shadowRadius: 8,
    alignItems: "center",
    paddingTop: 0,
  },

  buttonStyle: {
    backgroundColor: palette.lightBlue,
    borderRadius: 32,
    width: "224rem",
  },

  quizButtonStyle: {
    backgroundColor: palette.lightBlue,
    borderRadius: 32,
    width: "100%",
    padding: 12
  },

  quizWrongButtonStyle: {
    backgroundColor: palette.red,
    borderRadius: 32,
    width: "100%",
    padding: 12,
  },

  quizCorrectButtonStyle: {
    backgroundColor: palette.green,
    borderRadius: 32,
    width: "100%",
    padding: 12,
  },

  quizButtonTitleStyle: {
    fontWeight: "bold",
  },

  quizButtonContainerStyle: {
    marginVertical: 12,
    width: 48
  },

  titleStyle: {
    color: palette.white,
    fontWeight: "bold",
    fontSize: "18rem",
  },

  completedTitleStyle: {
    color: palette.lightBlue,
    fontWeight: "bold",
    fontSize: "18rem",
  },

  modalBackground: {
    alignItems: "center",
    backgroundColor: palette.white,
    minHeight: "80%",
    // maxHeight: "100%",
    // flexGrow: 1,
    justifyContent: "flex-end",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  incorrectAnswerText: {
    color: palette.red,
    fontSize: 16,
  },

  correctAnswerText: {
    color: palette.green,
    fontSize: 16,
  },

  quizTextAnswer: {
    color: palette.darkGrey,
    textAlign: "left"
    // fontWeight: "bold"
    // fontSize: 18,
  },

  keepDiggingContainerStyle: {
    marginTop: 18,
    flex: 1,
    alignItems: "center",
    minHeight: "18rem",
    marginBottom: "24rem"
  },
})

const mappingLetter = {0: "A", 1: "B", 2: "C"}

export const EarnQuiz = ({ route, navigation }) => {
  const { title, text, amount, answers, feedback, 
    question, onComplete, id, completed } = route.params
  
  const [quizVisible, setQuizVisible] = useState(false)
  const [recordedAnswer, setRecordedAnswer] = useState([])
  const [permutation] = useState(shuffle([0, 1, 2]))

  const addRecordedAnswer = (value) => {
    setRecordedAnswer([...recordedAnswer, value])
  }

  const answers_shuffled = []

  useEffect(() => {
    if (recordedAnswer.indexOf(0) !== -1) {
      onComplete()
    }
  }, [recordedAnswer])
  
  const close = async () => {
    setQuizVisible(false)
    await sleep(100)
    navigation.goBack()
  }

  let j = 0
  permutation.forEach((i) => {
    answers_shuffled.push(
      <View style={{width: "100%"}}>
        <View style={{flexDirection: "row", alignItems: "center"}}>
          <Button 
            title={mappingLetter[j]}
            buttonStyle={recordedAnswer.indexOf(i) === -1 ? 
                styles.quizButtonStyle
              : i === 0 ? 
                  styles.quizCorrectButtonStyle
                : styles.quizWrongButtonStyle}
            titleStyle={styles.quizButtonTitleStyle}
            containerStyle={styles.quizButtonContainerStyle}
            onPress={() => addRecordedAnswer(i)}
          />
          <Button
            title={answers[i]}
            titleStyle={styles.quizTextAnswer}
            containerStyle={{alignItems: "flex-start", marginLeft: 12, marginRight: 36}}
            type="clear"
            onPress={() => addRecordedAnswer(i)}
          />
        </View>
        { recordedAnswer.indexOf(i) !== -1 ?
          <Text style={i === 0 ? styles.correctAnswerText : styles.incorrectAnswerText}>{feedback[i]}</Text>
        : null }
      </View>
    )
    j++
  })

  return (
    <Screen style={{backgroundColor: palette.lighterGrey}} unsafe={true}>
      <Modal
        style={{ marginHorizontal: 0, marginBottom: 0, flexGrow: 1 }}
        isVisible={quizVisible}
        swipeDirection={quizVisible ? ["down"] : ["up"]}
        onSwipeComplete={() => setQuizVisible(false)}
        swipeThreshold={50}
        propagateSwipe={true}
      >
        {/* TODO: expand automatically */}
        <View style={{ flexShrink: 1 }}>
          <TouchableWithoutFeedback onPress={() => setQuizVisible(false)}>
            <View style={{height: "100%", width: "100%"}} />
          </TouchableWithoutFeedback>
        </View>
        <View style={styles.modalBackground}>
          <Icon
              name={"ios-remove"}
              size={72}
              color={palette.lightGrey}
              style={{ height: 44, top: -26 }}
            />
          <View style={{ flex: 1 }}>
            <ScrollView
              contentContainerStyle={{ paddingHorizontal: 24, marginHorizontal: 12 }}>
              <Text style={styles.title} >{question ?? title}</Text>
              {answers_shuffled}
              <SafeAreaView>
                { recordedAnswer.indexOf(0) !== -1 ?
                  <Button title={"Keep digging!"} 
                  type="outline" onPress={async () => await close()}
                  containerStyle={styles.keepDiggingContainerStyle}
                  buttonStyle={styles.buttonStyle}
                  titleStyle={styles.titleStyle} />
                  : null }
              </SafeAreaView>
            </ScrollView>
          </View>
        </View>
      </Modal>
      <SafeAreaView style={{flex: 1, paddingBottom: 0}}>
        <ScrollView 
            persistentScrollbar={true}
            showsVerticalScrollIndicator={true}
            bounces={true}
            >
          <View style={styles.svgContainer}>
            {SVGs({name: id})}
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.text}>{text}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
      <CloseCross navigation={navigation} color={palette.darkGrey} />
      <SafeAreaView style={styles.bottomContainer}>
        {completed &&
          <View>
            <Text style={styles.textEarn}>Quiz completed and {amount} sats earned</Text>
            <Button title="Review quiz" type="clear"
              titleStyle={styles.completedTitleStyle}
            onPress={() => setQuizVisible(true)}
            />
          </View>
        || 
        <Button title={`Earn ${amount} sat`} 
          buttonStyle={styles.buttonStyle}
          titleStyle={styles.titleStyle}
          containerStyle={{paddingVertical: 12}}
          onPress={() => setQuizVisible(true)}
        />}
      </SafeAreaView>
    </Screen>
  )
}
