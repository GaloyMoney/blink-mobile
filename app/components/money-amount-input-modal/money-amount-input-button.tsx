import { useTheme, Text, makeStyles } from "@rneui/themed"
import React from "react"
import { Pressable, PressableProps, StyleProp, View, ViewStyle } from "react-native"
import { GaloyIcon } from "@app/components/atomic/galoy-icon"
import { testProps } from "@app/utils/testProps"

export type MoneyAmountInputButtonProps = {
  placeholder?: string
  value?: string
  iconName?: "pencil" | "info"
  error?: boolean
  disabled?: boolean
  secondaryValue?: string
  primaryTextTestProps?: string
} & PressableProps

export const MoneyAmountInputButton: React.FC<MoneyAmountInputButtonProps> = ({
  placeholder,
  value,
  iconName,
  error,
  disabled,
  secondaryValue,
  primaryTextTestProps,
  ...props
}) => {
  const { theme } = useTheme()
  const styles = useStyles()

  const pressableStyle = ({ pressed }: { pressed: boolean }): StyleProp<ViewStyle> => {
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
          backgroundColor: theme.colors.white,
        }
        break
      default:
        colorStyles = {
          backgroundColor: theme.colors.white,
        }
    }

    const sizeStyles = {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      height: secondaryValue ? 60 : 40,
      justifyContent: secondaryValue ? "space-between" : "center",
    }

    return [colorStyles, sizeStyles]
  }

  const primaryText = value || placeholder || ""

  return (
    <Pressable {...props} style={pressableStyle} disabled={disabled}>
      <View style={styles.contentContainerStyle}>
        <Text
          type="p1"
          color={error ? theme.colors.error4 : undefined}
          style={styles.primaryTextStyle}
          numberOfLines={1}
          ellipsizeMode="middle"
          {...(primaryTextTestProps ? testProps(primaryTextTestProps) : {})}
        >
          {primaryText}
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
