import { StyleSheet, View } from "react-native"
import Icon from "react-native-vector-icons/Ionicons"
import * as React from "react"

const styles = StyleSheet.create({
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
})

type Props = {
  onPress: () => void
  color: string
}

export const CloseCross: React.FC<Props> = ({ onPress, color }) => (
  <View style={styles.iconContainer}>
    <Icon name="ios-close" style={styles.icon} onPress={onPress} color={color} />
  </View>
)
