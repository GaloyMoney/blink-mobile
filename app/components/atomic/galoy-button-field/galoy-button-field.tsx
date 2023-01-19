import { useTheme, Text, makeStyles } from "@rneui/themed"
import React from "react"
import { Pressable, PressableProps, StyleProp, View, ViewStyle } from "react-native"
import { GaloyIcon } from "../galoy-icon"

export type GaloyButtonFieldProps = {
  placeholder?: string
  value?: string
  iconName?: "pencil" | "info"
  error?: boolean
  disabled?: boolean
  secondaryValue?: string
  style?: StyleProp<ViewStyle>
  highlightEnding?: boolean
} & PressableProps

export const GaloyButtonField = ({
  placeholder,
  value,
  iconName,
  error,
  disabled,
  secondaryValue,
  style,
  highlightEnding,
  ...props
}: GaloyButtonFieldProps) => {
  const { theme } = useTheme()
  const styles = useStyles()

  const pressableStyle = ({ pressed }): StyleProp<ViewStyle> => {
    let colorStyles = {}
    switch (true) {
      case error:
        colorStyles = {
          backgroundColor: theme.colors.error9,
        }
        break
      case pressed:
        colorStyles = {
          backgroundColor: theme.colors.primary9,
        }
        break
      case disabled:
        colorStyles = {
          opacity: 0.3,
          backgroundColor: theme.colors.primary10,
        }
        break
      default:
        colorStyles = {
          backgroundColor: theme.colors.primary10,
        }
    }

    const sizeStyles = {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      height: secondaryValue ? 60 : 40,
      justifyContent: secondaryValue ? "space-between" : "center",
    }

    return [style, colorStyles, sizeStyles]
  }

  const primaryText = value || placeholder || ""

  const indexToStartHighlight = primaryText.length - (highlightEnding ? 5 : 0)

  return (
    <Pressable {...props} style={pressableStyle} disabled={disabled}>
      <View style={styles.contentContainerStyle}>
        <Text
          type="p1"
          color={error ? theme.colors.error4 : undefined}
          style={styles.primaryTextStyle}
          numberOfLines={1}
          ellipsizeMode="middle"
        >
          {primaryText.slice(0, indexToStartHighlight)}
          <Text type="p1" color={error ? theme.colors.error4 : undefined} bold>
            {primaryText.slice(indexToStartHighlight)}
          </Text>
        </Text>
        {iconName && (
          <GaloyIcon
            style={styles.iconStyle}
            name={iconName}
            size={20}
            color={error ? theme.colors.error4 : theme.colors.primary}
          />
        )}
      </View>
      {secondaryValue && (
        <Text type="p4" color={error ? theme.colors.error4 : undefined}>
          {secondaryValue}
        </Text>
      )}
    </Pressable>
  )
}

const useStyles = makeStyles(() => ({
  contentContainerStyle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
  },
  iconStyle: {
    marginLeft: 8,
    flex: 1,
  },
  primaryTextStyle: {
    flex: 1,
  },
}))
