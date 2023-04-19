import React, { FunctionComponent, PropsWithChildren } from "react"
import { Button, ButtonProps, useTheme, makeStyles } from "@rneui/themed"
import LinearGradient from "react-native-linear-gradient"
import { TouchableHighlight } from "react-native"

export const GaloyPrimaryButton: FunctionComponent<PropsWithChildren<ButtonProps>> = (
  props,
) => {
  const { theme } = useTheme()
  const linearGradientProps = theme.colors.horizonBlue
  const styles = useStyles()

  return (
    <Button
      {...props}
      activeOpacity={0.7}
      TouchableComponent={TouchableHighlight}
      ViewComponent={LinearGradient}
      buttonStyle={styles.buttonStyle}
      titleStyle={styles.titleStyle}
      disabledStyle={styles.disabledStyle}
      disabledTitleStyle={styles.disabledTitleStyle}
      linearGradientProps={linearGradientProps}
    />
  )
}

const useStyles = makeStyles((theme) => ({
  titleStyle: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "600",
  },
  buttonStyle: {
    minHeight: 50,
  },
  disabledStyle: {
    opacity: 0.3,
  },
  disabledTitleStyle: {
    color: theme.colors.white,
  },
}))
