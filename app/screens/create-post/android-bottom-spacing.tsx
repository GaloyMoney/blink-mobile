import * as React from "react"
import { Dimensions, Platform, View } from "react-native"
export const AndroidBottomSpace = ({
  isPaddingBottom,
}: {
  isPaddingBottom?: boolean
}) => {
  if (Platform.OS === "android" || isPaddingBottom) return <View style={{ height: 80 }} />
  return null
}
