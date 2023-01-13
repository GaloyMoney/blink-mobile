import React from "react"

import { storiesOf } from "@storybook/react-native"

import { Story, StoryScreen, UseCase } from "../../../../storybook/views"
import { Sliders } from "./"

const onSlidingComplete = () => {
  console.log("callback called!")
}

storiesOf("Galoy Slider Button", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <UseCase text="Default">
        <Sliders
          callback={onSlidingComplete}
          initialText={"slide to send"}
          slidingText={"send"}
          completedText={"sent!"}
          showSlidingTextIcon
          loading={false}
        />
      </UseCase>
      <UseCase text="Sending">
        <Sliders
          callback={onSlidingComplete}
          initialText={"slide to send"}
          slidingText={"converting"}
          completedText={"completed"}
          showSlidingTextIcon
          loading
        />
      </UseCase>
      <UseCase text="Disabled">
        <Sliders disabled={true} disabledText={"disabled"} />
      </UseCase>
    </Story>
  ))
