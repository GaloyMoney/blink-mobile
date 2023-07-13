import React from "react"
import { StyleProp, TouchableWithoutFeedback, View, ViewStyle } from "react-native"
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
> = ({ text, icon, selected, onPress }) => {
  const styles = useStyles(Boolean(selected))
  return (
    <TouchableWithoutFeedback onPress={onPress}>
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
  style?: StyleProp<ViewStyle>
  disabled?: boolean
  onPress: (id: string) => void
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  buttons,
  selectedId,
  onPress,
  style,
  disabled,
}) => {
  const styles = useStyles()
  const selectedButton = buttons.find(({ id }) => id === selectedId)

  return (
    <View style={[styles.buttonGroup, style]}>
      {!disabled &&
        buttons.map((props) => (
          <ButtonForButtonGroup
            key={props.id}
            {...props}
            onPress={() => {
              if (selectedId !== props.id) {
                onPress(props.id)
              }
            }}
            selected={selectedId === props.id}
          />
        ))}
      {disabled && selectedButton && (
        <ButtonForButtonGroup {...selectedButton} selected={true} onPress={() => {}} />
      )}
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
    paddingVertical: 10,
    marginHorizontal: 3,
    borderRadius: 5,
    backgroundColor: selected ? colors.grey5 : colors.grey4,
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
