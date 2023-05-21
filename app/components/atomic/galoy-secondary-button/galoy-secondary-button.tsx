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
  const {
    theme: { colors },
  } = useTheme()
  const styles = useStyles(props)

  const icon = iconName ? (
    <GaloyIcon
      name={iconName}
      size={18}
      color={grey ? colors.grey5 : colors.primary}
      style={styles.iconStyle}
    />
  ) : null

  return (
    <Button
      {...remainingProps}
      underlayColor={colors.primary4}
      activeOpacity={1}
      {...(icon ? { icon } : {})}
      TouchableComponent={TouchableHighlight}
      buttonStyle={styles.buttonStyle}
      disabledStyle={styles.disabledStyle}
      titleStyle={styles.buttonTitleStyle}
      disabledTitleStyle={styles.disabledTitleStyle}
      loadingProps={{
        color: colors.primary,
      }}
    />
  )
}

const useStyles = makeStyles(({ colors }, props: GaloySecondaryButtonProps) => ({
  disabledStyle: {
    opacity: 0.3,
  },
  buttonStyle: {
    backgroundColor: colors.transparent,
  },
  buttonTitleStyle: {
    color: props.grey ? colors.grey5 : colors.primary,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "600",
  },
  disabledTitleStyle: {
    color: props.grey ? colors.grey5 : colors.primary,
  },
  iconStyle: {
    marginRight: props.iconPosition === "right" ? 0 : 10,
    marginLeft: props.iconPosition === "left" ? 0 : 10,
  },
}))
