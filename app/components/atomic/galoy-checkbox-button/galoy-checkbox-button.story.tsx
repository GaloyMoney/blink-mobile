import React from "react"

import { storiesOf } from "@storybook/react-native"

import { Story, StoryScreen, UseCase } from "../../../../storybook/views"
import { GaloyCheckboxButton } from "./galoy-checkbox-button"

storiesOf("Galoy Checkbox Button", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <UseCase text="Radio">
        <GaloyCheckboxButton buttonType={"radio"} />
      </UseCase>
      <UseCase text="Checkbox">
        <GaloyCheckboxButton buttonType={"checkbox"} />
      </UseCase>
      <UseCase text="Disabled Checkbox">
        <GaloyCheckboxButton buttonType={"checkbox"} disabled={true} title={"disabled"} />
      </UseCase>
    </Story>
  ))
