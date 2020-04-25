import * as React from "react"
import { storiesOf } from "@storybook/react-native"
import { StoryScreen, Story, UseCase } from "../../../storybook/views"
import { Price } from "./price"

declare let module

const data = [
  { x: 0, y: 6000 },
  { x: 1, y: 7000 },
  { x: 2, y: 7500 },
  { x: 3, y: 6500 },
  { x: 4, y: 7000 },
  { x: 5, y: 7500 },
  { x: 6, y: 6000 },
  { x: 7, y: 7000 },
  { x: 8, y: 7500 },
  { x: 9, y: 6500 },
  { x: 10, y: 7000 },
  { x: 11, y: 7500 },
];

storiesOf("Price Component", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <UseCase text="BTC" usage="The primary." noBackground={true}>
        <Price price={6874.25} delta={0.70} data={data} />
      </UseCase>
    </Story>
  ))
