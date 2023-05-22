import { MockedProvider } from "@apollo/client/testing"
import { Text, darkColors, useTheme } from "@rneui/themed"
import { Meta } from "@storybook/react-native"
import React from "react"
import { StyleSheet, View } from "react-native"

import { StoryScreen } from "../../.storybook/views"

const styles = StyleSheet.create({
  view: { padding: 10, margin: 10 },
  wrapper: { marginBottom: 10, marginTop: 5, backgroundColor: darkColors.grey3 },
  wrapperOutside: { marginVertical: 10 },
})

const textVariations = ["h1", "h2", "p1", "p2", "p3", "p4"] as const

export default {
  title: "Theme text",
  component: Text,
  decorators: [
    (Story) => (
      <MockedProvider>
        <View style={styles.view}>
          <StoryScreen>{Story()}</StoryScreen>
        </View>
      </MockedProvider>
    ),
  ],
} as Meta<typeof Text>

const Wrapper = ({ children, text }) => (
  <View style={styles.wrapperOutside}>
    <Text style={styles.wrapper}>{text}</Text>
    {children}
  </View>
)

export const Default = () => {
  const {
    theme: { colors },
  } = useTheme()
  return (
    <>
      {textVariations.map((variation) => (
        <Wrapper key={variation} text={variation}>
          <Text type={variation}>Some text</Text>
          <Text type={variation} bold>
            Some bold text
          </Text>
          <Text type={variation} color={colors.primary} bold>
            Some colorful text
          </Text>
        </Wrapper>
      ))}
    </>
  )
}
