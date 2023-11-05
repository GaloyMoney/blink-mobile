import * as React from "react"
import { View, ViewStyle } from "react-native"
import { ScrollView } from "react-native-gesture-handler"

const ROOT: ViewStyle = { flex: 1 }

export const Story: React.FC<React.PropsWithChildren> = (props) => (
  <View style={ROOT}>
    <ScrollView>{props.children}</ScrollView>
  </View>
)
