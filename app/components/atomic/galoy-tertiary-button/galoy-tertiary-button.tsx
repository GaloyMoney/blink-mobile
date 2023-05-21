import { makeStyles, Text, useTheme } from "@rneui/themed"
import React from "react"
import { Pressable, PressableProps, StyleProp, View, ViewStyle } from "react-native"

export type GaloyTertiaryButtonProps = {
  outline?: boolean
  containerStyle?: StyleProp<ViewStyle>
  title: string
  icon?: JSX.Element
} & PressableProps

export const GaloyTertiaryButton = (props: GaloyTertiaryButtonProps) => {
  const { outline, containerStyle, disabled, icon, ...remainingProps } = props
  const styles = useStyles(props)
  const {
    theme: { colors },
  } = useTheme()
  const pressableStyle = ({ pressed }: { pressed: boolean }): StyleProp<ViewStyle> => {
    let dynamicStyle
    switch (true) {
      case pressed && outline:
        dynamicStyle = {
          borderColor: colors.primary,
          backgroundColor: colors.primary4,
          borderWidth: 1.5,
        }
        break
      case pressed && !outline:
        dynamicStyle = {
          backgroundColor: colors.primary4,
        }
        break
      case outline:
        dynamicStyle = {
          backgroundColor: colors.transparent,
          borderColor: disabled ? colors.primary3 : colors.primary,
          borderWidth: 1.5,
        }
        break
      default:
        dynamicStyle = {
          backgroundColor: colors.primary4,
        }
    }

    const disabledStyle = disabled ? { opacity: 0.7 } : {}

    const sizingStyle = {
      paddingHorizontal: 16,
      paddingVertical: 4,
      borderRadius: 50,
    }

    return [sizingStyle, disabledStyle, dynamicStyle, containerStyle]
  }

  return (
    <Pressable {...remainingProps} style={pressableStyle} disabled={disabled}>
      <View style={styles.container}>
        <Text style={styles.buttonTitleStyle}>{props.title}</Text>
        {icon ? icon : null}
      </View>
    </Pressable>
  )
}

const useStyles = makeStyles(({ colors }, props: GaloyTertiaryButtonProps) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonTitleStyle: {
    lineHeight: 20,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
    opacity: props.disabled ? 0.7 : 1,
  },
}))
