import React from "react"
import { storiesOf } from "@storybook/react-native"
import { Story, StoryScreen, UseCase } from "../../.storybook/views"
import { Text } from "@rneui/themed"
import colors from "@app/rne-theme/colors"

const textVariations = ["h1", "h2", "p1", "p2", "p3", "p4"]

storiesOf("Theme text", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      {textVariations.map((variation) => {
        return (
          <UseCase text={variation} key="1">
            <Text type={variation}>Some text</Text>
            <Text type={variation} bold>
              Some bold text
            </Text>
            <Text type={variation} color={colors.primary} bold>
              Some colorful text
            </Text>
          </UseCase>
        )
      })}
    </Story>
  ))
