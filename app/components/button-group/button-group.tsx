import React from "react"
import { TouchableWithoutFeedback, View } from "react-native"
import { Text, makeStyles } from "@rneui/themed"
import Icon from "react-native-vector-icons/Ionicons"

type ButtonForButtonGroupProps = {
  id: string
  text: string
  icon: string
}

const ButtonForButtonGroup: React.FC<
  ButtonForButtonGroupProps & {
    selected: boolean
    onPress: () => void
  }
> = ({ id, text, icon, selected, onPress }) => {
  const styles = useStyles(Boolean(selected))
  return (
    <TouchableWithoutFeedback key={id} onPress={onPress}>
      <View style={styles.button}>
        <Text style={styles.text}>{text}</Text>
        <Icon style={styles.text} name={icon} />
      </View>
    </TouchableWithoutFeedback>
  )
}

export type ButtonGroupProps = {
  selectedId: string
  buttons: ButtonForButtonGroupProps[]
  onPress: (id: string) => void
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  buttons,
  selectedId,
  onPress,
}) => {
  const styles = useStyles()

  return (
    <View style={styles.buttonGroup}>
      {buttons.map((props) => (
        <ButtonForButtonGroup
          {...props}
          onPress={() => onPress(props.id)}
          selected={selectedId === props.id}
        />
      ))}
    </View>
  )
}

const useStyles = makeStyles(({ colors }, selected: boolean) => ({
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    marginHorizontal: 3,
    borderRadius: 5,
    backgroundColor: colors.grey4,
  },
  text: {
    fontSize: 16,
    color: selected ? colors.primary : colors.grey1,
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
}))
