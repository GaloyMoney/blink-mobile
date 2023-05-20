import { MockedProvider } from "@apollo/client/testing"
import { Button, Text, useThemeMode } from "@rneui/themed"
import { Meta } from "@storybook/react-native"
import React from "react"
import { View } from "react-native"
import { StoryScreen } from "../../.storybook/views"

export default {
  title: "Set dark/light mode",
  decorators: [
    (Story) => (
      <MockedProvider>
        <StoryScreen>{Story()}</StoryScreen>
      </MockedProvider>
    ),
  ],
} as Meta<typeof Text>

export const Default = () => {
  const { mode, setMode } = useThemeMode()
  const nonActiveTheme = mode === "light" ? "dark" : "light"
  const toggleTheme = () => {
    setMode(nonActiveTheme)
  }

  return (
    <View>
      <Button title={`Set mode: ${nonActiveTheme}`} onPress={toggleTheme} />
    </View>
  )
}
