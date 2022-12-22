import React from "react"
import { storiesOf } from "@storybook/react-native"
import { Story, StoryScreen, UseCase } from "../../../../storybook/views"
import { GaloyPrimaryButton } from "."

storiesOf("Galoy Primary Button", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <UseCase text="Happy path">
        <GaloyPrimaryButton title="Happy path" />
      </UseCase>
      <UseCase text="Long title">
        <GaloyPrimaryButton title="What happens if the title is really long, like super long" />
      </UseCase>
      <UseCase text="Disabled button">
        <GaloyPrimaryButton disabled title="Disabled" />
      </UseCase>
    </Story>
  ))
