import * as React from "react"
import { StyleSheet, View, SafeAreaView, Text, Alert } from "react-native"
import { palette } from "../../theme/palette"
import Modal from "react-native-modal"
import { Button } from "react-native-elements"
import { color } from "../../theme"
import Icon from "react-native-vector-icons/Ionicons"

const styles = StyleSheet.create({
  modalBackground: {
    alignItems: "center",
    backgroundColor: palette.white,
    height: 400,
    justifyContent: "flex-end",
    paddingHorizontal: 20,
  },

  modalText: {
    fontSize: 24,
    marginVertical: 12,
  },

  textButton: {
    backgroundColor: color.primary,
    marginVertical: 8,
  },
})

interface IQuizz {
  quizzVisible: boolean
  setQuizzVisible(boolean): void
  quizzData: {
    question: string
    answers: string[]
    feedback: string[]
    correct: number
  }
  close(msg): void
}

export const Quizz = ({ quizzVisible, setQuizzVisible, quizzData, close }: IQuizz) => {
  if (quizzData.question == undefined) {
    return null
  }

  const permutation = shuffle([0, 1, 2])
  const answers = []

  permutation.forEach((i) => {
    answers.push(
      <Button
        title={quizzData.answers[i]}
        buttonStyle={styles.textButton}
        onPress={() => {
          i === 0 ? close(quizzData.feedback[0]) : Alert.alert(quizzData.feedback[i])
        }}
        key={i}
      />,
    )
  })

  return (
    <Modal
      style={{ marginHorizontal: 0, marginBottom: 0 }}
      isVisible={quizzVisible}
      swipeDirection={quizzVisible ? ["down"] : ["up"]}
      onSwipeComplete={() => setQuizzVisible(false)}
      swipeThreshold={50}
    >
      <View style={{ flex: 1 }}>
        {/* <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={{flex: 1}}></View>
                </TouchableWithoutFeedback> */}
      </View>
      <View style={styles.modalBackground}>
        <Icon
          name={"ios-remove"}
          size={64}
          color={palette.lightGrey}
          style={{ height: 34, top: -22 }}
        />
        <SafeAreaView style={{ flex: 1 }}>
          <Text style={styles.modalText}>{quizzData.question}</Text>
          {answers}
        </SafeAreaView>
      </View>
    </Modal>
  )
}
