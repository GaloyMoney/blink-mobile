import { storiesOf } from "@storybook/react-native"
import * as React from "react"
import { InputPayment } from "."
import { StoryScreen } from "../../../storybook/views"
import {reactNavigationDecorator} from "../../../storybook/storybook-navigator";
import { withKnobs, select, number} from "@storybook/addon-knobs";

declare let module

storiesOf("InputPayment", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .addDecorator(reactNavigationDecorator)
      .addDecorator(withKnobs)

  .add("Input Field - Dynamic", () => (
        <InputPayment
          nextPrefCurrency={select("currency", ["USD" , "BTC"], "USD" )}
          primaryAmount={{currency: select("currency", ["USD" , "BTC"], "USD" ), value: number("amount", 100)}}
          secondaryAmount={{currency: select("currency", ["USD" , "BTC"], "BTC" ), value: number("amount", 100)}}
          onUpdateAmount={() => true}
          editable
        />
  ))

