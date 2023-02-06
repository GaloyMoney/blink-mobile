import * as React from "react"
import { ViewStyle, KeyboardAvoidingView, Platform } from "react-native"
import { MockedProvider } from "@apollo/client/testing"
const ROOT: ViewStyle = { backgroundColor: "#f0f0f0", flex: 1 }

export interface StoryScreenProps {
  children?: React.ReactNode
}
const behavior = Platform.OS === "ios" ? "padding" : null
export const StoryScreen = (props: StoryScreenProps) => (
  <KeyboardAvoidingView
    style={ROOT}
    behavior={behavior || undefined}
    keyboardVerticalOffset={50}
  >
    <MockedProvider>{props.children}</MockedProvider>
  </KeyboardAvoidingView>
)
