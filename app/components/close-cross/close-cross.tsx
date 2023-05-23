import { View } from "react-native"
import Icon from "react-native-vector-icons/Ionicons"
import * as React from "react"
import { makeStyles } from "@rneui/themed"

const useStyles = makeStyles(() => ({
  icon: {
    fontSize: 72,
  },

  iconContainer: {
    alignItems: "flex-end",
    padding: 6,
    position: "absolute",
    right: 8,
    top: 16,
  },
}))

type Props = {
  onPress: () => void
  color: string
}

export const CloseCross: React.FC<Props> = ({ onPress, color }) => {
  const styles = useStyles()

  return (
    <View style={styles.iconContainer}>
      <Icon name="ios-close" style={styles.icon} onPress={onPress} color={color} />
    </View>
  )
}
