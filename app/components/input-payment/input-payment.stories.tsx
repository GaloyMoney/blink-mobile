import { storiesOf } from "@storybook/react-native"
import * as React from "react"
import { InputPayment } from "."
import { Story, StoryScreen, UseCase } from "../../../storybook/views"
import {reactNavigationDecorator} from "../../../storybook/storybook-navigator";

declare let module

storiesOf("InputPayment", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .addDecorator(reactNavigationDecorator)
  .add("Style Presets", () => (
    <Story>
      <UseCase text="Editable" usage="Loading">
        <InputPayment
          nextPrefCurrency="USD"
          primaryAmount={{currency: "USD", value: 0.00011}}
          secondaryAmount={{currency: "BTC", value: 0.00011}}
          onUpdateAmount={() => true}
          editable
        />
      </UseCase>
      <UseCase text="Non editable" usage="Loading">
        <InputPayment
          nextPrefCurrency="USD"
          primaryAmount={{currency: "USD", value: 0.00011}}
          secondaryAmount={{currency: "BTC", value: 0.00011}}
          onUpdateAmount={() => true}
          editable={false}
        />
      </UseCase>
    </Story>
  ))
