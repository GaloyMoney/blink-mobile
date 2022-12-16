import React from "react"
import { palette } from "@app/theme"
import { View, ViewStyle } from "react-native"
import { Button } from "@rneui/themed"
import EStyleSheet from "react-native-extended-stylesheet"

type GaloyButtonProps = {
  text: string
  loading?: boolean
  overrideStyle?: ViewStyle
  onPress: () => void
}

export const GaloyButton = ({
  text,
  loading = false,
  overrideStyle,
  onPress,
}: GaloyButtonProps) => (
  <View style={styles.container}>
    <Button
      title={text}
      loading={loading}
      style={overrideStyle ? { ...styles.button, ...overrideStyle } : styles.button}
      onPress={onPress}
    />
  </View>
)

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: palette.primaryButtonColor,
    color: palette.white,
    borderRadius: 8,
    paddingHorizonal: 153,
    paddingVertical: 12,
  },
})
