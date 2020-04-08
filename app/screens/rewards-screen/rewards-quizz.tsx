import * as React from "react"
import { useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { Button } from "react-native-elements"
import { ScrollView, TouchableWithoutFeedback } from "react-native-gesture-handler"
import Modal from "react-native-modal"
import Icon from "react-native-vector-icons/Ionicons"
import { Screen } from "../../components/screen"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import { shuffle } from "../../utils/helper"
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

  quizzButtonTitleStyle: {
    fontWeight: "bold"
  },

  quizzButtonContainerStyle: {
    marginVertical: 12,
  },

  titleStyle: {
    color: color.primary,
    fontWeight: "bold",
    fontSize: 24,
  },

  modalBackground: {
    alignItems: "center",
    backgroundColor: palette.white,
    height: "70%",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
})

export const RewardsQuizz = ({ route, navigation }) => {
  
  const { title, text, amount, answers, feedback } = route.params

  console.tron.log({ title, text, amount, answers, feedback })

  const [quizzVisible, setQuizzVisible] = useState(false)

  const permutation = shuffle([0, 1, 2])
  const answers_shuffled = []

  // FIXME use useEffect to not have ongoing change of quizz questions
  permutation.forEach((i) => {
    answers_shuffled.push(
      <Button
        title={answers[i]}
        buttonStyle={styles.quizzButtonStyle}
        titleStyle={styles.quizzButtonTitleStyle}
        containerStyle={styles.quizzButtonContainerStyle}
        onPress={() => {i === 0 ? close(feedback[0]) : Alert.alert(feedback[i])}}
        key={i}
      />
    )
  })

  return (
    <Screen style={{backgroundColor: palette.offWhite}}>
      <Modal
        style={{ marginHorizontal: 0, marginBottom: 0 }}
        isVisible={quizzVisible}
        swipeDirection={quizzVisible ? ["down"] : ["up"]}
        onSwipeComplete={() => setQuizzVisible(false)}
        swipeThreshold={50}
      >
        <View style={{ height: "50%" }}>
          <TouchableWithoutFeedback onPress={() => setQuizzVisible(false)}>
            <View style={{height: "100%", width: "100%"}} />
          </TouchableWithoutFeedback>
        </View>
        <View style={styles.modalBackground}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{title}</Text>
            {answers_shuffled}
          </View>
        </View>
      </Modal>
      <View style={styles.iconContainer}>
        <Icon name="ios-close" size={96} color={palette.darkGrey} onPress={navigation.goBack}/>
      </View>
      <View style={styles.svgContainer}>
        <Svg />
      </View>
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
