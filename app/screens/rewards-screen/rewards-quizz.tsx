import * as React from "react"
import { useEffect, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { Button } from "react-native-elements"
import { ScrollView, TouchableWithoutFeedback } from "react-native-gesture-handler"
import Modal from "react-native-modal"
import Icon from "react-native-vector-icons/Ionicons"
import { Screen } from "../../components/screen"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import { shuffle } from "../../utils/helper"
import { sleep } from "../../utils/sleep"
import Svg from "../welcome-screens/honey-badger-shovel-01.svg"

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "flex-end",
    paddingRight: 12,
  },

  svgContainer: {
    alignItems: "center",
  },

  textContainer: {
    marginHorizontal: 24,
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
    fontSize: 24,
    color: color.primary,
    paddingVertical: 12,
    fontWeight: "bold",
  },

  bottomContainer: {
    borderTopWidth: 1,
    borderTopColor: palette.lighterGrey,
    alignItems: "center",
  },

  buttonStyle: {
    borderColor: color.primary,
    borderRadius: 32,
    borderWidth: 2,
    width: "100%"
  },

  quizzButtonStyle: {
    backgroundColor: color.primary,
    borderRadius: 32,
    width: "100%",
    padding: 12
  },

  quizzWrongButtonStyle: {
    backgroundColor: palette.angry,
    borderRadius: 32,
    width: "100%",
    padding: 12
  },

  quizzCorrectButtonStyle: {
    backgroundColor: palette.green,
    borderRadius: 32,
    width: "100%",
    padding: 12
  },

  quizzButtonTitleStyle: {
    fontWeight: "bold"
  },

  quizzButtonContainerStyle: {
    marginVertical: 12,
    width: 48
  },

  titleStyle: {
    color: color.primary,
    fontWeight: "bold",
    fontSize: 24,
  },

  modalBackground: {
    alignItems: "center",
    backgroundColor: palette.white,
    // minHeight: "70%",
    // maxHeight: "100%",
    flexGrow: 3,
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  incorrectAnswerText: {
    color: palette.angry,
    fontSize: 16,
  },

  correctAnswerText: {
    color: palette.green,
    fontSize: 16,
  },

  quizzTextAnswer: {
    color: palette.black,
    textAlign: "left"
    // fontWeight: "bold"
    // fontSize: 18,
  },

  keepDiggingContainerStyle: {
    marginTop: 18,
    flex: 1,
  },
})

const mappingLetter = {0: "A", 1: "B", 2: "C"}

export const RewardsQuizz = ({ route, navigation }) => {
  const { title, text, amount, answers, feedback, question, onComplete } = route.params
  
  const [quizzVisible, setQuizzVisible] = useState(false)
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
    setQuizzVisible(false)
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
                styles.quizzButtonStyle
              : i === 0 ? 
                  styles.quizzCorrectButtonStyle
                : styles.quizzWrongButtonStyle}
            titleStyle={styles.quizzButtonTitleStyle}
            containerStyle={styles.quizzButtonContainerStyle}
            onPress={() => addRecordedAnswer(i)}
          />
          <Button
            title={answers[i]}
            titleStyle={styles.quizzTextAnswer}
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
  }
  )

  return (
    <Screen style={{backgroundColor: palette.offWhite}}>
      <Modal
        style={{ marginHorizontal: 0, marginBottom: 0 }}
        isVisible={quizzVisible}
        swipeDirection={quizzVisible ? ["down"] : ["up"]}
        onSwipeComplete={() => setQuizzVisible(false)}
        swipeThreshold={50}
      >
        {/* TODO: expand automatically */}
        <View style={{ flex: 1 }}>
          <TouchableWithoutFeedback onPress={() => setQuizzVisible(false)}>
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
          <View style={{ flex: 1, marginHorizontal: 24 }}>
            <Text style={styles.title} >{question}</Text>
            {answers_shuffled}
            { recordedAnswer.indexOf(0) !== -1 ?
              <Button title={"Keep digging!"} 
                      type="outline" onPress={async () => await close()}
                      containerStyle={styles.keepDiggingContainerStyle}
                      buttonStyle={styles.buttonStyle}
                      titleStyle={styles.titleStyle} />
            : null }
          </View>
        </View>
      </Modal>
      <View style={styles.iconContainer}>
        <Icon name="ios-close" size={96} color={palette.darkGrey} onPress={() => navigation.goBack()}/>
      </View>
      <View style={styles.svgContainer}>
        <Svg />
      </View>
      {/* animate scroll view https://medium.com/appandflow/react-native-scrollview-animated-header-10a18cb9469e */}
      <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          persistentScrollbar={true}
          bouncesZoom={true}
          showsVerticalScrollIndicator={true}
          bounces={false}
        >
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.text}>{text}</Text>
        </View>
      </ScrollView>
      <View style={styles.bottomContainer}>
        <Text style={styles.textEarn}>Earn {amount} sat</Text>
        <Button title={"Answer Quizz"} type="outline"
          buttonStyle={styles.buttonStyle}
          titleStyle={styles.titleStyle}
          onPress={() => setQuizzVisible(true)}
        />
      </View>
    </Screen>
  )
}
