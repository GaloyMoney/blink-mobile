import React from "react"
import { storiesOf } from "@storybook/react-native"
import { Story, StoryScreen, UseCase } from "../../../../storybook/views"
import { GaloySecondaryButton } from "."

storiesOf("Galoy Secondary Button", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <UseCase text="Default">
        <GaloySecondaryButton title="Happy path" />
      </UseCase>
      <UseCase text="Long title">
        <GaloySecondaryButton title="What happens if the title is really long, like super long" />
      </UseCase>
      <UseCase text="Disabled button">
        <GaloySecondaryButton disabled title="Disabled" />
      </UseCase>
      <UseCase text="Icon Left">
        <GaloySecondaryButton iconName="contact" iconPosition="left" title="Icon Left" />
      </UseCase>
      <UseCase text="Icon Right">
        <GaloySecondaryButton
          iconName="contact"
          iconPosition="right"
          title="Icon Right"
        />
      </UseCase>
      <UseCase text="Grey Icon Right">
        <GaloySecondaryButton
          iconName="contact"
          grey
          iconPosition="right"
          title="Grey Button"
        />
      </UseCase>
    </Story>
  ))
