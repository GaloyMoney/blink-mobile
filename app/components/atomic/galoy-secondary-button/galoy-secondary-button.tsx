import React, { FunctionComponent, PropsWithChildren } from "react"
import { Button, ButtonProps, makeStyles, useTheme } from "@rneui/themed"
import { TouchableHighlight } from "react-native"
import { GaloyIcon, IconNamesType } from "../galoy-icon"

declare module "@rneui/themed" {
  interface ButtonProps {
    underlayColor?: string
  }
}

type GaloySecondaryButtonProps = PropsWithChildren<ButtonProps> & {
  iconName?: IconNamesType
  grey?: boolean
}

export const GaloySecondaryButton: FunctionComponent<GaloySecondaryButtonProps> = (
  props,
) => {
  const { iconName, grey, ...remainingProps } = props
  const { theme } = useTheme()
  const styles = useStyles(props)

  const icon = iconName ? (
    <GaloyIcon
      name={iconName}
      size={18}
      color={grey ? theme.colors.grey5 : theme.colors.primary}
      style={styles.iconStyle}
    />
  ) : null

  return (
    <Button
      {...remainingProps}
      underlayColor={theme.colors.primary4}
      activeOpacity={1}
      {...(icon ? { icon } : {})}
      TouchableComponent={TouchableHighlight}
      buttonStyle={styles.buttonStyle}
      disabledStyle={styles.disabledStyle}
      titleStyle={styles.buttonTitleStyle}
      disabledTitleStyle={styles.disabledTitleStyle}
      loadingProps={{
        color: theme.colors.primary,
      }}
    />
  )
}

const useStyles = makeStyles((theme, props: GaloySecondaryButtonProps) => ({
  disabledStyle: {
    opacity: 0.3,
  },
  buttonStyle: {
    backgroundColor: "transparent",
  },
  buttonTitleStyle: {
    color: props.grey ? theme.colors.grey5 : theme.colors.primary,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "600",
  },
  disabledTitleStyle: {
    color: props.grey ? theme.colors.grey5 : theme.colors.primary,
  },
  iconStyle: {
    marginRight: props.iconPosition === "right" ? 0 : 10,
    marginLeft: props.iconPosition === "left" ? 0 : 10,
  },
}))
