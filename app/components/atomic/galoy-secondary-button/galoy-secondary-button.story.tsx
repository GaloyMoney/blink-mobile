import React from "react"
import { storiesOf } from "@storybook/react-native"
import { Story, StoryScreen, UseCase } from "../../../../storybook/views"
import { GaloySecondaryButton } from "."

storiesOf("Galoy Secondary Button", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <UseCase text="Happy path">
        <GaloySecondaryButton title="Happy path" />
      </UseCase>
      <UseCase text="Long title">
        <GaloySecondaryButton title="What happens if the title is really long, like super long" />
      </UseCase>
      <UseCase text="Disabled button">
        <GaloySecondaryButton disabled title="Disabled" />
      </UseCase>
    </Story>
  ))
