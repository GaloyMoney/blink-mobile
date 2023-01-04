import React from "react"

import { storiesOf } from "@storybook/react-native"

import { Story, StoryScreen, UseCase } from "../../../../storybook/views"
import { GaloyCheckboxButton } from "./galoy-checkbox-button"

storiesOf("Galoy Checkbox Button", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <UseCase text="Radio unchecked">
        <GaloyCheckboxButton checked={false} buttonType={"radio"} />
      </UseCase>
      <UseCase text="Radio">
        <GaloyCheckboxButton checked buttonType={"radio"} />
      </UseCase>
      <UseCase text="Checkbox unchecked">
        <GaloyCheckboxButton checked={false} buttonType={"checkbox"} />
      </UseCase>
      <UseCase text="Checkbox checked">
        <GaloyCheckboxButton checked buttonType={"checkbox"} />
      </UseCase>
      <UseCase text="Disabled Checkbox">
        <GaloyCheckboxButton
          checked={false}
          buttonType={"checkbox"}
          disabled={true}
          title={"disabled"}
        />
      </UseCase>
    </Story>
  ))
