import React from "react"
import { storiesOf } from "@storybook/react-native"
import { Story, StoryScreen, UseCase } from "../../../../storybook/views"
import { Sliders } from "."

storiesOf("Galoy Slider Button", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <UseCase text="Default">
        <Sliders />
      </UseCase>
    </Story>
  ))
