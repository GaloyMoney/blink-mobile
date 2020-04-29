import { View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons"
import * as React from "react"
import EStyleSheet from "react-native-extended-stylesheet";

const styles = EStyleSheet.create({
  iconContainer: {
    position: "absolute",
    right: "12rem",
    top: "12rem",
    alignItems: "flex-end",
    padding: "6rem",
  },

  icon: {
    fontSize: "72rem"
  }
})

export const CloseCross = ({onPress, color}) => (
  <View style={styles.iconContainer}>
    <Icon name="ios-close"
      size={styles._icon.fontSize}
      onPress={onPress}
      color={color}
    />
  </View>
)