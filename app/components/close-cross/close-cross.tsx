import { View } from "react-native"
import Icon from "react-native-vector-icons/Ionicons"
import * as React from "react"
import EStyleSheet from "react-native-extended-stylesheet"

const styles = EStyleSheet.create({
  // eslint-disable-next-line react-native/no-unused-styles
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

type Props = {
  onPress: () => void
  color: string
}

export const CloseCross: React.FC<Props> = ({ onPress, color }: Props) => (
  <View style={styles.iconContainer}>
    <Icon name="ios-close" size={styles.icon.fontSize} onPress={onPress} color={color} />
  </View>
)
