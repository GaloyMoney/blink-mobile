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
      <GaloySliderButton initialText="default" />
    </UseCase>
    <UseCase text="Disabled slider">
      <GaloySliderButton disabled initialText="Disabled" />
    </UseCase>
  </Story>
)
