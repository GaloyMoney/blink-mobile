import React from "react"
import { storiesOf } from "@storybook/react-native"
import { Story, StoryScreen, UseCase } from "../../storybook/views"
import { Text } from "@rneui/themed"
import colors from "@app/rne-theme/colors"
import { View } from "react-native"

const themeColors = Object.keys(colors).filter(
  (key) => key !== "horizonBlue" && key !== "verticalBlue",
)

storiesOf("Theme colors", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <UseCase text="Theme colors" style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {themeColors.map((color) => (
          <View style={{ marginRight: 10, marginBottom: 10 }}>
            <View
              style={{
                height: 40,
                width: 70,
                backgroundColor: colors[color],
                borderColor: "grey",
                borderWidth: 1,
              }}
            ></View>
            <Text type="p2">{color}</Text>
          </View>
        ))}
      </UseCase>
    </Story>
  ))
