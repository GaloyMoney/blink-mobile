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
      <GaloySliderButton initialText="default" buttonSize={60} />
    </UseCase>
    <UseCase text="Disabled slider">
      <GaloySliderButton disabled={true} initialText="Disabled" buttonSize={60} />
    </UseCase>
    <UseCase text="loading slider">
      <GaloySliderButton loading={true} initialText="" buttonSize={60} />
    </UseCase>
  </Story>
)
