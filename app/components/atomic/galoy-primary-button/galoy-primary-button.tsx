import React, { FunctionComponent, PropsWithChildren } from "react"
import { Button, ButtonProps, useTheme } from "@rneui/themed"
import LinearGradient from "react-native-linear-gradient"
import { TouchableHighlight } from "react-native"

export const GaloyPrimaryButton: FunctionComponent<PropsWithChildren<ButtonProps>> = (
  props,
) => {
  const { theme } = useTheme()
  const linearGradientProps = theme.colors.horizonBlue
  const disabledStyle = {
    opacity: 0.3,
  }
  const disabledTitleStyle = {
    color: theme.colors.white,
  }

  return (
    <Button
      activeOpacity={0.7}
      TouchableComponent={TouchableHighlight}
      ViewComponent={LinearGradient}
      disabledStyle={disabledStyle}
      disabledTitleStyle={disabledTitleStyle}
      linearGradientProps={linearGradientProps}
      {...props}
    />
  )
}
