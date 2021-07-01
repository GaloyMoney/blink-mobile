import { storiesOf } from "@storybook/react-native"
import * as React from "react"
import { InputPayment } from "."
import { Story, StoryScreen, UseCase } from "../../../storybook/views"

declare let module

storiesOf("InputPayment", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <UseCase text="Editable" usage="Loading">
        <InputPayment
          currencyPreference="USD"
          price={0.00011}
          onUpdateAmount={() => {}}
          editable
        />
      </UseCase>
      <UseCase text="Non editable" usage="Loading">
        <InputPayment
          currencyPreference="USD"
          price={0.00011}
          initAmount={12345}
          onUpdateAmount={() => {}}
          editable={false}
        />
      </UseCase>
    </Story>
  ))
