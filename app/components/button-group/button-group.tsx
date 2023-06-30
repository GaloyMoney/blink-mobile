import React from "react"
import { TouchableWithoutFeedback, View } from "react-native"
import { Text, makeStyles } from "@rneui/themed"
import Icon from "react-native-vector-icons/Ionicons"

type ButtonForButtonGroup = {
  text: string
  icon: string
}

export type ButtonGroupProps = {
  buttons: ButtonForButtonGroup[]
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({ buttons }) => {
  const styles = useStyles()

  return (
    <View style={styles.buttonGroup}>
      {buttons.map(({ text, icon }) => (
        <TouchableWithoutFeedback>
          <View style={styles.button}>
            <Text>{text}</Text>
            <Icon style={styles.icon} name={icon} />
          </View>
        </TouchableWithoutFeedback>
      ))}
    </View>
  )
}

const useStyles = makeStyles(() => ({
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 5,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 3,
    borderRadius: 5,
  },
  icon: {
    fontSize: 16,
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
}))
