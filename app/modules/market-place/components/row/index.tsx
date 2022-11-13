import React from "react"
import { StyleProp, TouchableOpacity, View, ViewStyle } from "react-native"
interface RowProps {
  children: any
  containerStyle?: StyleProp<ViewStyle>
  vc?: boolean
  hc?: boolean
  onPress?: () => void
}
export const Row = ({ children, containerStyle, vc, hc, onPress }: RowProps) => {
  return (
    <TouchableOpacity
      activeOpacity={1}
      disabled={!onPress}
      onPress={onPress}
      style={{ width: "100%" }}
    >
      <View
        style={[
          {
            flexDirection: "row",
          },
          containerStyle,
          vc && { justifyContent: "center" },
          hc && { alignItems: "center" },
        ]}
      >
        {children}
      </View>
    </TouchableOpacity>
  )
}
