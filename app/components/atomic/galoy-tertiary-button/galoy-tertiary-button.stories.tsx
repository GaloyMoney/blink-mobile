/* eslint-disable */

import React from "react"
import { Story, UseCase } from "../../../../.storybook/views"
import { GaloyTertiaryButton } from "."

export default {
  title: "Galoy Tertiary Button",
  component: GaloyTertiaryButton,
}

export const Default = () => (
  <Story>
    <UseCase text="Default" style={{ flexDirection: "column", alignItems: "center" }}>
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
)
