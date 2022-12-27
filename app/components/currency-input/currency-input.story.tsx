import * as React from "react"
import { storiesOf } from "@storybook/react-native"
import { Story, StoryScreen, UseCase } from "../../../storybook/views"
import { CurrencyInput } from "./currency-input"

declare let module

storiesOf("Large Button", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <UseCase text="Dollar" usage="The primary.">
        <CurrencyInput currencyType="USD" onValueChange={(value) => console.log(value)} />
      </UseCase>
    </Story>
  ))
