import React, { FC, PropsWithChildren } from "react"
import { Button, ButtonProps, makeStyles } from "@rneui/themed"
import { TouchableHighlight } from "react-native"

export const GaloyPrimaryButton: FC<PropsWithChildren<ButtonProps>> = (props) => {
  const styles = useStyles()

  return (
    <Button
      activeOpacity={0.85}
      TouchableComponent={TouchableHighlight}
      buttonStyle={styles.buttonStyle}
      titleStyle={styles.titleStyle}
      disabledStyle={styles.disabledStyle}
      disabledTitleStyle={styles.disabledTitleStyle}
      {...props}
    />
  )
}

const useStyles = makeStyles(({ colors }) => ({
  titleStyle: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "600",
    color: colors.white,
  },
  disabledTitleStyle: {
    color: colors.grey5,
  },
  buttonStyle: {
    minHeight: 50,
    backgroundColor: colors.primary3,
  },
  disabledStyle: {
    opacity: 0.5,
    backgroundColor: colors.primary3,
  },
}))
