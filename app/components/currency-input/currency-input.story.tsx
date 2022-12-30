import * as React from "react"
import { storiesOf } from "@storybook/react-native"
import { Story, StoryScreen, UseCase } from "../../../storybook/views"
import { CurrencyInput } from "./currency-input"

declare let module

storiesOf("Currency Input", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <UseCase text="USD" usage="USD currency input">
        <CurrencyInput currencyType="USD" onValueChange={(value) => console.log("onValueChange: " + value)} />
      </UseCase>
    </Story>
  ))
