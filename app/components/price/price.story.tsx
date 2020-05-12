import * as React from "react"
import { storiesOf } from "@storybook/react-native"
import { StoryScreen, Story, UseCase } from "../../../storybook/views"
import { Price } from "./price"
import { data } from "./data-tst"

declare let module


storiesOf("Price Component", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <UseCase text="BTC" usage="The primary." noBackground={true}>
        <Price data={data} />
      </UseCase>
    </Story>
  ))
