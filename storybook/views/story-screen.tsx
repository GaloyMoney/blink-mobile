import * as React from "react"
import { ViewStyle, KeyboardAvoidingView, Platform, Text } from "react-native"

const ROOT: ViewStyle = { backgroundColor: "#f0f0f0", flex: 1, top: 15, alignItems: "center" }

export interface StoryScreenProps {
  children?: React.ReactNode
}

const behavior = Platform.OS === "ios" ? "padding" : null
export const StoryScreen = (props) => (
  <KeyboardAvoidingView style={ROOT} behavior={behavior} keyboardVerticalOffset={50}>
    <Text>{props.children}</Text>
  </KeyboardAvoidingView>
)
