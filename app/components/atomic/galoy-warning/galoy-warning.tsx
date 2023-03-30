import { makeStyles, Text, useTheme } from "@rneui/themed"
import React from "react"
import { View } from "react-native"
import { GaloyIcon } from "../galoy-icon"

type GaloyWarningProps = {
  errorMessage: string
  highlight?: boolean
  noIcon?: boolean
}

export const GaloyWarning: React.FC<GaloyWarningProps> = ({
  errorMessage,
  highlight,
  noIcon,
}) => {
  const { theme } = useTheme()
  const styles = useStyles({ highlight })

  return (
    <View style={styles.warningContainer}>
      {!noIcon && <GaloyIcon name="warning" size={14} color={theme.colors.error4} />}
      <Text style={styles.textContainer} type={"p3"} color={theme.colors.error4}>
        {errorMessage}
      </Text>
    </View>
  )
}

type UseStylesProps = {
  highlight?: boolean
}

const useStyles = makeStyles((theme, { highlight }: UseStylesProps) => ({
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: highlight ? theme.colors.error9 : undefined,
  },
  textContainer: {
    overflow: "hidden",
    marginLeft: 4,
    flex: 1,
  },
}))
