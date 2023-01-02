import * as React from "react"
import { storiesOf } from "@storybook/react-native"
import { Story, StoryScreen, UseCase } from "../../../storybook/views"
import { CurrencyKeyboard } from "./currency-keyboard"

declare let module

storiesOf("Currency Keyboard", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <UseCase text="Currency Keyboard">
        <CurrencyKeyboard onPress={(pressed) => console.log(pressed)} />
      </UseCase>
    </Story>
  ))
