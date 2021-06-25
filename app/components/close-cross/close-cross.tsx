import { View } from "react-native"
import Icon from "react-native-vector-icons/Ionicons"
import * as React from "react"
import EStyleSheet from "react-native-extended-stylesheet"

const styles = EStyleSheet.create({
  icon: {
    fontSize: "72rem",
  },

  iconContainer: {
    alignItems: "flex-end",
    padding: "6rem",
    position: "absolute",
    right: "8rem",
    top: "16rem",
  },
})

export const CloseCross = ({ onPress, color }) => (
  <View style={styles.iconContainer}>
    <Icon name="ios-close" size={styles.icon.fontSize} onPress={onPress} color={color} />
  </View>
)
