import React from "react"
import { StyleProp, TouchableWithoutFeedback, View, ViewStyle } from "react-native"
import { Text, makeStyles } from "@rneui/themed"
import Icon from "react-native-vector-icons/Ionicons"
import { testProps } from "@app/utils/testProps"

type ButtonForButtonGroupProps = {
  id: string
  text: string
  icon:
    | string
    | {
        selected: React.ReactElement
        normal: React.ReactElement
      }
}

const ButtonForButtonGroup: React.FC<
  ButtonForButtonGroupProps & {
    selected: boolean
    last: boolean
    onPress: () => void
  }
> = ({ text, icon, selected, last, onPress }) => {
  const styles = useStyles({ selected: Boolean(selected), last: Boolean(last) })
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={styles.button}>
        <Text {...testProps(text)} style={styles.text}>
          {text}
        </Text>
        {typeof icon === "string" ? (
          <Icon style={styles.text} name={icon} />
        ) : selected ? (
          icon.selected
        ) : (
          icon.normal
        )}
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
  const lastButtonId = buttons[buttons.length - 1].id

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
            last={props.id === lastButtonId}
          />
        ))}
      {disabled && selectedButton && (
        <ButtonForButtonGroup
          {...selectedButton}
          selected={true}
          onPress={() => {}}
          last={true}
        />
      )}
    </View>
  )
}

const useStyles = makeStyles(
  ({ colors }, { selected, last }: { selected: boolean; last: boolean }) => ({
    button: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 10,
      paddingVertical: 14,
      marginRight: last ? 0 : 6,
      borderRadius: 8,
      backgroundColor: selected ? colors.grey4 : colors.grey5,
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
  }),
)
