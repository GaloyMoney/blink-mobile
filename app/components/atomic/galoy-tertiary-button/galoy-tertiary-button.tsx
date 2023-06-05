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
          backgroundColor: colors.primary,
          borderWidth: 1.5,
        }
        break
      case pressed && !outline:
        dynamicStyle = {
          backgroundColor: colors.primary,
        }
        break
      case outline:
        dynamicStyle = {
          opacity: disabled ? 0.7 : 1,
          backgroundColor: colors.transparent,
          borderColor: colors.primary5,
          borderWidth: 1.5,
        }
        break
      default:
        dynamicStyle = {
          backgroundColor: colors.primary3,
        }
    }

    const sizingStyle = {
      paddingHorizontal: 16,
      paddingVertical: 4,
      borderRadius: 50,
    }

    return [sizingStyle, dynamicStyle, containerStyle]
  }

  return (
    <Pressable {...remainingProps} style={pressableStyle} disabled={disabled}>
      <View style={styles.container}>
        <Text
          color={outline ? colors.black : colors.white}
          style={styles.buttonTitleStyle}
        >
          {props.title}
        </Text>
        {icon ? icon : null}
      </View>
    </Pressable>
  )
}

const useStyles = makeStyles((_, props: GaloyTertiaryButtonProps) => ({
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
    opacity: props.disabled ? 0.7 : 1,
  },
}))
