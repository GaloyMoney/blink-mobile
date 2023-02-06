import * as React from "react"
import { ViewStyle, KeyboardAvoidingView, Platform } from "react-native"
import TypesafeI18n from "@app/i18n/i18n-react"
import { detectDefaultLocale } from "../../app/utils/locale-detector"
import { MockedProvider } from "@apollo/client/testing"

const ROOT: ViewStyle = { backgroundColor: "#f0f0f0", flex: 1 }
const behavior = Platform.OS === "ios" ? "padding" : null

export const StoryScreen: React.FC<React.PropsWithChildren> = ({ children }) => (
  <KeyboardAvoidingView
    style={ROOT}
    behavior={behavior || undefined}
    keyboardVerticalOffset={50}
  >
    <MockedProvider>
      <TypesafeI18n locale={detectDefaultLocale()}>{children}</TypesafeI18n>
    </MockedProvider>
  </KeyboardAvoidingView>
)
