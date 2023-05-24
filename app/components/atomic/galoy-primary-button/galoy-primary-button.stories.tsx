import React from "react"
import { Story, UseCase } from "../../../../.storybook/views"
import { GaloyPrimaryButton } from "."

export default {
  title: "Galoy Primary Button",
  component: GaloyPrimaryButton,
}

export const Default = () => (
  <Story>
    <UseCase text="Default">
      <GaloyPrimaryButton title="Happy path" />
    </UseCase>
    <UseCase text="Long title">
      <GaloyPrimaryButton title="What happens if the title is really long, like super long" />
    </UseCase>
    <UseCase text="Disabled button">
      <GaloyPrimaryButton disabled title="Disabled" />
    </UseCase>
  </Story>
)
