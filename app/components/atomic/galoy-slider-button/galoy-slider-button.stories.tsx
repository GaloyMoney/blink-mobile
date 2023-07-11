import React from "react"
import { Story, UseCase } from "../../../../.storybook/views"
import { GaloySliderButton } from "./galoy-slider-button"

export default {
  title: "Galoy Slider Button",
  component: GaloySliderButton,
}

export const Default = () => (
  <Story>
    <UseCase text="Default">
      <GaloySliderButton initialText="Happy path" />
    </UseCase>
    <UseCase text="Disabled button">
      <GaloySliderButton disabled initialText="Disabled" />
    </UseCase>
  </Story>
)
