import * as React from "react"
import { Dimensions, Platform, View } from "react-native"
export const AndroidBottomSpace = ({}) => {
  if (Platform.OS === "android") return <View style={{ height: 80 }} />
  return null
}
