import * as React from "react"
import { ScrollView, View, ViewStyle } from "react-native"

const ROOT: ViewStyle = { flex: 1 }

export const Story: React.FC<React.PropsWithChildren> = (props) => (
  <View style={ROOT}>
    <ScrollView>{props.children}</ScrollView>
  </View>
)
