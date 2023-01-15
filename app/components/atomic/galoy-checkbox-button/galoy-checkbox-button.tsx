import React from "react"
import { GestureResponderEvent, View } from "react-native"

import { CheckBox, CheckBoxProps, Icon, makeStyles, useTheme } from "@rneui/themed"

import { GaloyIcon } from "../galoy-icon"

type ButtonTypeOptions = "radio" | "checkbox"

type GaloyCheckboxButtonProps = {
  buttonType: ButtonTypeOptions
  disabled?: boolean
  onPress?: (event: GestureResponderEvent) => void
}

export const GaloyCheckboxButton = (props: GaloyCheckboxButtonProps & CheckBoxProps) => {
  const { theme } = useTheme()
  const styles = useStyles()

  return (
    <CheckBox
      center
      disabled={props.disabled}
      checkedIcon={
        props.buttonType === "radio" ? (
          "dot-circle-o"
        ) : (
          <View style={styles.CheckBox}>
            <GaloyIcon name="check" size={20} color={theme.colors.white} />
          </View>
        )
      }
      uncheckedIcon={
        props.buttonType === "radio" ? (
          <Icon
            name="radio-button-unchecked"
            type="material"
            color={theme.colors.primary5}
            size={20}
          />
        ) : undefined
      }
      uncheckedColor={props.disabled ? theme.colors.primary7 : theme.colors.primary8}
      checkedColor={theme.colors.primary5}
      checked={props.checked}
      onPress={props.onPress}
    />
  )
}

const useStyles = makeStyles((theme) => ({
  CheckBox: {
    backgroundColor: theme.colors.primary5,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    padding: 0.5,
  },
}))
