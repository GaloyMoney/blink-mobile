/* eslint-disable */

import React from "react"
import { storiesOf } from "@storybook/react-native"
import { Story, StoryScreen, UseCase } from "../../../../.storybook/views"
import { GaloyTertiaryButton } from "."

storiesOf("Galoy Tertiary Button", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <UseCase text="Default" style={{ flexDirection: "column", alignItems:'center' }}>
        <GaloyTertiaryButton
          title="Transaction details"
          containerStyle={{ marginRight: 5 }}
        />
        <GaloyTertiaryButton title="Disabled" disabled />
      </UseCase>
      <UseCase text="Outline" style={{ flexDirection: "row" }}>
        <GaloyTertiaryButton
          title="Transaction details"
          outline
          containerStyle={{ marginRight: 5 }}
        />
        <GaloyTertiaryButton title="Disabled" outline disabled />
      </UseCase>
    </Story>
  ))
