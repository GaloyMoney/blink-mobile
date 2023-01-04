import React, { useState } from "react"
import { CheckBox, Icon, makeStyles, useTheme } from "@rneui/themed"
import { GaloyIcon } from "../galoy-icon"
import { View } from "react-native"

type ButtonTypeOptions = "radio" | "checkbox"

type GaloyCheckboxButtonProps = {
  buttonType: ButtonTypeOptions
  disabled?: boolean
  callback?: () => void
  title?: string
}

export const GaloyCheckboxButton = (props: GaloyCheckboxButtonProps) => {
  const { theme } = useTheme()
  const styles = useStyles(theme)

  const [checked, setChecked] = useState<boolean>(false)

  const onPress = () => {
    setChecked(!checked)
    if (props.callback) {
      props.callback()
    }
  }

  return (
    <>
      <CheckBox
        {...props}
        center
        disabled={props.disabled}
        title={props.title}
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
        checked={checked}
        onPress={onPress}
      />
    </>
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
