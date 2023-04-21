import * as React from "react"
import { Story, UseCase } from "../../../.storybook/views"
import { CurrencyKeyboard } from "./currency-keyboard"

export default {
  title: "Currency Keyboard",
  component: CurrencyKeyboard,
}

export const StylePresets = () => (
  <Story>
    <UseCase text="Currency Keyboard">
      <CurrencyKeyboard onPress={(pressed) => console.log(pressed)} />
    </UseCase>
  </Story>
)

StylePresets.storyName = "Style Presets"
