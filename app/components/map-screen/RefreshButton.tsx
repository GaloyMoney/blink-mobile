import React from "react"
import { TouchableOpacity } from "react-native"
import { makeStyles, Text, useTheme } from "@rneui/themed"
import Icon from "react-native-vector-icons/Ionicons"

type Props = {
  onRefresh: () => void
}

export const RefreshButton: React.FC<Props> = ({ onRefresh }) => {
  const styles = useStyles()
  const { colors } = useTheme().theme

  return (
    <TouchableOpacity style={styles.refresh} onPress={onRefresh}>
      <Icon name="refresh" size={20} color={colors.white} />
      <Text style={styles.text}>Refresh</Text>
    </TouchableOpacity>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  refresh: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    top: 90,
    opacity: 0.8,
    borderRadius: 100,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.green,
    zIndex: 1,
  },
  text: {
    color: colors._white,
    fontSize: 18,
    marginLeft: 5,
  },
}))
