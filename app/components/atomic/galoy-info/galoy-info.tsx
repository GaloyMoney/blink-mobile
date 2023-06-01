import { makeStyles, Text, useTheme } from "@rneui/themed"
import React, { ReactNode } from "react"
import { View } from "react-native"

type GaloyInfoProps = {
  highlight?: boolean
  children: ReactNode
}

export const GaloyInfo: React.FC<GaloyInfoProps> = ({ children }) => {
  const {
    theme: { colors },
  } = useTheme()
  const styles = useStyles()

  return (
    <View style={styles.container}>
      <View style={styles.verticalLine} />
      <View style={styles.infoContainer}>
        <Text style={styles.textContainer} type={"p3"} color={colors.blue5}>
          {children}
        </Text>
      </View>
    </View>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  container: {
    flexDirection: "row",
  },
  infoContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: colors.grey5,
  },
  verticalLine: {
    width: 3,
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
    backgroundColor: colors.blue5,
    height: "100%",
  },
  textContainer: {
    overflow: "hidden",
  },
}))
