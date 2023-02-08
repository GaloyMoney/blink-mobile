import React from "react"

import { storiesOf } from "@storybook/react-native"

import { Story, StoryScreen, UseCase } from "../../../../.storybook/views"
import { GaloyCheckboxButton } from "./galoy-checkbox-button"

const onPress = () => {
  console.log("pressed")
}

storiesOf("Galoy Checkbox Button", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <UseCase text="Radio unchecked">
        <GaloyCheckboxButton checked={false} buttonType={"radio"} onPress={onPress} />
      </UseCase>
      <UseCase text="Radio">
        <GaloyCheckboxButton checked buttonType={"radio"} onPress={onPress} />
      </UseCase>
      <UseCase text="Checkbox unchecked">
        <GaloyCheckboxButton checked={false} onPress={onPress} buttonType={"checkbox"} />
      </UseCase>
      <UseCase text="Checkbox checked">
        <GaloyCheckboxButton checked buttonType={"checkbox"} onPress={onPress} />
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
