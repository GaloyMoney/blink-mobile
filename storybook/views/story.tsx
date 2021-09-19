import * as React from "react"
import { ScrollView, View, ViewStyle, Text } from "react-native"

export interface StoryProps {
  children?: React.ReactNode
}

const ROOT: ViewStyle = { flex: 1, width:"100%"}

export function Story(props: StoryProps) {
  return (
    <View style={ROOT}>
        <ScrollView>
            {props.children}
        </ScrollView>
    </View>
  )
}
