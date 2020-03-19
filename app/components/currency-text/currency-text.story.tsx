import * as React from "react"
import { storiesOf } from "@storybook/react-native"
import { StoryScreen, Story, UseCase } from "../../../storybook/views"
import { CurrencyText } from "./"
import { CurrencyType } from "../../utils/enum"


declare let module

storiesOf("CurrencyText", module)
  .addDecorator(fn => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <UseCase text="BTC" usage="The primary.">
        <CurrencyText currency={CurrencyType.BTC} amount={1} />
      </UseCase>
      <UseCase text="USD" usage="The primary.">
        <CurrencyText currency={CurrencyType.USD} amount={1} />
      </UseCase>
    </Story>
  ))
