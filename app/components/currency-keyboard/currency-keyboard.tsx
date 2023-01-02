import { palette } from "@app/theme"
import React from "react"
import { View } from "react-native"
import { Button } from "@rneui/base"
import EStyleSheet from "react-native-extended-stylesheet"

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.white,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    flex: 1,
  },
  buttonContainer: {
    backgroundColor: palette.white,
    borderRadius: 40,
  },
  button: {
    width: 80,
    height: 80,
    backgroundColor: palette.white,
  },
  buttonText: {
    color: palette.greyFive,
  },
})

type CurrencyKeyboardProps = {
  onPress: (pressed: string) => void
}

export const CurrencyKeyboard = ({ onPress }: CurrencyKeyboardProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.buttonRow}>
        <Button
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.button}
          titleStyle={styles.buttonText}
          title="1"
          onPress={() => onPress("1")}
        />
        <Button
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.button}
          titleStyle={styles.buttonText}
          title="2"
          onPress={() => onPress("2")}
        />
        <Button
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.button}
          titleStyle={styles.buttonText}
          title="3"
          onPress={() => onPress("3")}
        />
      </View>
      <View style={styles.buttonRow}>
        <Button
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.button}
          titleStyle={styles.buttonText}
          title="4"
          onPress={() => onPress("4")}
        />
        <Button
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.button}
          titleStyle={styles.buttonText}
          title="5"
          onPress={() => onPress("5")}
        />
        <Button
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.button}
          titleStyle={styles.buttonText}
          title="6"
          onPress={() => onPress("6")}
        />
      </View>
      <View style={styles.buttonRow}>
        <Button
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.button}
          titleStyle={styles.buttonText}
          title="7"
          onPress={() => onPress("7")}
        />
        <Button
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.button}
          titleStyle={styles.buttonText}
          title="8"
          onPress={() => onPress("8")}
        />
        <Button
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.button}
          titleStyle={styles.buttonText}
          title="9"
          onPress={() => onPress("9")}
        />
      </View>
      <View style={styles.buttonRow}>
        <Button
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.button}
          titleStyle={styles.buttonText}
          title="."
          onPress={() => onPress(".")}
        />
        <Button
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.button}
          titleStyle={styles.buttonText}
          title="0"
          onPress={() => onPress("0")}
        />
        <Button
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.button}
          titleStyle={styles.buttonText}
          title="⌫"
          onPress={() => onPress("\b")}
        />
      </View>
    </View>
  )
}
