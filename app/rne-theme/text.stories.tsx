import { MockedProvider } from "@apollo/client/testing"
import { Text } from "@rneui/themed"
import { ComponentMeta } from "@storybook/react-native"
import React from "react"
import { View } from "react-native"

import EStyleSheet from "react-native-extended-stylesheet"
import { StoryScreen } from "../../.storybook/views"
import { palette } from "../theme"

const styles = EStyleSheet.create({
  view: { padding: 10, margin: 10 },
  wrapper: { marginBottom: 10, marginTop: 5, backgroundColor: palette.orange },
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
} as ComponentMeta<typeof Text>

const Wrapper = ({ children, text }) => (
  <View style={styles.wrapperOutside}>
    <Text style={styles.wrapper}>{text}</Text>
    {children}
  </View>
)

export const Default = () => (
  <View>
    {textVariations.map((variation) => (
      <Wrapper key={variation} text={variation}>
        <Text type={variation}>Some text</Text>
        <Text type={variation} bold>
          Some bold text
        </Text>
        <Text type={variation} color={palette.primaryButtonColor} bold>
          Some colorful text
        </Text>
      </Wrapper>
    ))}
  </View>
)
