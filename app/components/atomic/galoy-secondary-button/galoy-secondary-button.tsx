import React, { FunctionComponent, PropsWithChildren } from "react"
import { Button, ButtonProps, useTheme } from "@rneui/themed"
import { TouchableHighlight } from "react-native"

declare module "@rneui/themed" {
  interface ButtonProps {
    underlayColor?: string
  }
}

export const GaloySecondaryButton: FunctionComponent<PropsWithChildren<ButtonProps>> = (
  props,
) => {
  const { theme } = useTheme()
  const disabledStyle = {
    opacity: 0.3,
  }

  const buttonStyle = {
    backgroundColor: "transparent",
  }

  const buttonTitleStyle = {
    color: theme.colors.primary,
  }

  const disabledTitleStyle = {
    color: theme.colors.primary,
  }

  return (
    <Button
      underlayColor={theme.colors.primary9}
      activeOpacity={1}
      TouchableComponent={TouchableHighlight}
      buttonStyle={buttonStyle}
      disabledStyle={disabledStyle}
      titleStyle={buttonTitleStyle}
      disabledTitleStyle={disabledTitleStyle}
      {...props}
    />
  )
}
