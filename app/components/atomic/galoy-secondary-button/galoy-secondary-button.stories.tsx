import React from "react"
import { Story, UseCase } from "../../../../.storybook/views"
import { GaloySecondaryButton } from "."

export default {
  title: "Galoy Secondary Button",
  component: GaloySecondaryButton,
}

export const Default = () => (
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
      <GaloySecondaryButton iconName="people" iconPosition="left" title="Icon Left" />
    </UseCase>
    <UseCase text="Icon Right">
      <GaloySecondaryButton iconName="people" iconPosition="right" title="Icon Right" />
    </UseCase>
    <UseCase text="Grey Icon Right">
      <GaloySecondaryButton
        iconName="people"
        grey
        iconPosition="right"
        title="Grey Button"
      />
    </UseCase>
  </Story>
)
