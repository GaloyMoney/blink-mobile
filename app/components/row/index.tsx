import React from "react"
import { StyleProp, View, ViewStyle } from "react-native"
interface RowProps {
  children: any
  containerStyle?: StyleProp<ViewStyle>
}
export const Row = ({ children, containerStyle }: RowProps) => {
  return <View style={[{ flexDirection: "row" }, containerStyle]}>{children}</View>
}
