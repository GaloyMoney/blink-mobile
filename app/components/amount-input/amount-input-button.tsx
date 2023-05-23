import { useTheme, Text, makeStyles } from "@rneui/themed"
import React from "react"
import { Pressable, PressableProps, StyleProp, View, ViewStyle } from "react-native"
import { GaloyIcon } from "@app/components/atomic/galoy-icon"
import { testProps } from "@app/utils/testProps"

export type AmountInputButtonProps = {
  placeholder?: string
  value?: string
  iconName?: "pencil" | "info"
  error?: boolean
  disabled?: boolean
  secondaryValue?: string
  primaryTextTestProps?: string
} & PressableProps

export const AmountInputButton: React.FC<AmountInputButtonProps> = ({
  placeholder,
  value,
  iconName,
  error,
  disabled,
  secondaryValue,
  primaryTextTestProps,
  ...props
}) => {
  const {
    theme: { colors },
  } = useTheme()
  const styles = useStyles()

  const pressableStyle = ({ pressed }: { pressed: boolean }): StyleProp<ViewStyle> => {
    let colorStyles = {}
    switch (true) {
      case error:
        colorStyles = {
          backgroundColor: colors.error9,
        }
        break
      case pressed:
        colorStyles = {
          backgroundColor: colors.primary4,
        }
        break
      case disabled:
        colorStyles = {
          backgroundColor: colors.grey4,
        }
        break
      default:
        colorStyles = {
          backgroundColor: colors.grey4,
        }
    }

    const sizeStyles = {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      minHeight: 60,
      justifyContent: "center",
    }

    return [colorStyles, sizeStyles]
  }

  const primaryText = value || placeholder || ""

  return (
    <Pressable {...props} style={pressableStyle} disabled={disabled}>
      <View style={styles.contentContainerStyle}>
        <Text
          type="p1"
          color={error ? colors.error : undefined}
          numberOfLines={1}
          ellipsizeMode="middle"
          {...(primaryTextTestProps ? testProps(primaryTextTestProps) : {})}
        >
          {primaryText}
        </Text>
        {iconName && (
          <GaloyIcon
            name={iconName}
            size={20}
            color={error ? colors.error : colors.primary}
          />
        )}
      </View>
      {secondaryValue && (
        <Text type="p4" color={error ? colors.error : undefined}>
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
  },
}))
