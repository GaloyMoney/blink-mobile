import { makeStyles, Text, useTheme } from "@rneui/themed"
import React, { ReactNode } from "react"
import { View } from "react-native"

type GaloyInfoProps = {
  highlight?: boolean
  children: ReactNode
}

export const GaloyInfo: React.FC<GaloyInfoProps> = ({ highlight, children }) => {
  const { theme } = useTheme()
  const styles = useStyles({ highlight })

  if (!highlight) {
    return (
      <Text style={styles.textContainer} type={"p3"} color={theme.colors.primary3}>
        {children}
      </Text>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.verticalLine} />
      <View style={styles.infoContainer}>
        <Text style={styles.textContainer} type={"p3"} color={theme.colors.primary3}>
          {children}
        </Text>
      </View>
    </View>
  )
}

type UseStylesProps = {
  highlight?: boolean
}

const useStyles = makeStyles((theme, { highlight }: UseStylesProps) => ({
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
    borderColor: theme.colors.primary3,
    backgroundColor: highlight ? theme.colors.primary5 : undefined,
  },
  verticalLine: {
    width: 3,
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
    backgroundColor: theme.colors.primary3,
    height: "100%",
  },
  textContainer: {
    overflow: "hidden",
  },
}))
