import React, { FunctionComponent, PropsWithChildren } from "react"
import { Button, ButtonProps, useTheme } from "@rneui/themed"
import { StyleProp, TextStyle, TouchableHighlight } from "react-native"
import { GaloyIcon, IconNamesType } from "../galoy-icon"

declare module "@rneui/themed" {
  interface ButtonProps {
    underlayColor?: string
  }
}

type AdditionalProps = {
  iconName?: IconNamesType
  grey?: boolean
}

export const GaloySecondaryButton: FunctionComponent<
  PropsWithChildren<ButtonProps> & AdditionalProps
> = (props) => {
  const { iconName, grey, ...remainingProps } = props
  const { theme } = useTheme()
  const disabledStyle = {
    opacity: 0.3,
  }

  const buttonStyle = {
    backgroundColor: "transparent",
  }

  const buttonTitleStyle: StyleProp<TextStyle> = {
    color: grey ? theme.colors.grey5 : theme.colors.primary,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "600",
  }

  const disabledTitleStyle = {
    color: grey ? theme.colors.grey5 : theme.colors.primary,
  }

  const iconStyle = {
    marginRight: remainingProps.iconPosition === "right" ? 0 : 10,
    marginLeft: remainingProps.iconPosition === "left" ? 0 : 10,
  }

  const icon = iconName ? (
    <GaloyIcon
      name={iconName}
      size={18}
      color={grey ? theme.colors.grey5 : theme.colors.primary}
      style={iconStyle}
    />
  ) : null

  return (
    <Button
      {...remainingProps}
      underlayColor={theme.colors.primary9}
      activeOpacity={1}
      icon={icon}
      TouchableComponent={TouchableHighlight}
      buttonStyle={buttonStyle}
      disabledStyle={disabledStyle}
      titleStyle={buttonTitleStyle}
      disabledTitleStyle={disabledTitleStyle}
    />
  )
}
