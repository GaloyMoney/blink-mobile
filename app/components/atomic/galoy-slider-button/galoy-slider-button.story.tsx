import React from "react"

import { storiesOf } from "@storybook/react-native"

import { Story, StoryScreen, UseCase } from "../../../../storybook/views"
import { Sliders } from "./"

const onSlidingComplete = () => {
  console.log("callback called!")
  return null
}

storiesOf("Galoy Slider Button", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <UseCase text="Default">
        <Sliders callback={onSlidingComplete} text={"send"} />
      </UseCase>
      <UseCase text="Sent">
        <Sliders callback={onSlidingComplete} text={"sent!"} />
      </UseCase>
      <UseCase text="Disabled">
        <Sliders disabled={true} />
      </UseCase>
    </Story>
  ))
