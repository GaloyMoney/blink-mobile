import * as React from "react"
import { storiesOf } from "@storybook/react-native"
import { StoryScreen, Story, UseCase } from "../../../storybook/views"
import { InputPayment } from "."
import { CurrencyType } from "../../utils/enum"

declare let module

storiesOf("InputPayment", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <UseCase text="Dollar" usage="Loading">
        <InputPayment currencyPreference={"USD"} price={0.00011} />
      </UseCase>
    </Story>
  ))
