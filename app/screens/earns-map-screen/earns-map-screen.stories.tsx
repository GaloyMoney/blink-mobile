import { number, withKnobs } from "@storybook/addon-knobs"
import { storiesOf } from "@storybook/react-native"
import * as React from "react"
import { Story, StoryScreen } from "../../../storybook/views"
import BitcoinCircle from "./bitcoin-circle-01.svg"
import { EarnMapScreen } from "./earns-map-screen"

const sectionsData = [
  {
    text: "Bitcoin:\nwhat is it?",
    icon: BitcoinCircle,
    id: "bitcoinWhatIsIt",
    index: "1",
    onPress: () => ({}),
  },
  {
    text: "Bitcoin v traditional Money",
    icon: BitcoinCircle,
    id: "bitcoinWhatIsIt",
    index: "2",
    onPress: () => ({}),
  },
  {
    text: "Bitcoin:\nwhy is it special?",
    icon: BitcoinCircle,
    id: "bitcoinWhatIsIt",
    index: "3",
    onPress: () => ({}),
  },
]

declare let module

storiesOf("Map Earn", module)
  .addDecorator(withKnobs)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <EarnMapScreen
        currSection={number("section", 0)}
        progress={number("progress", 1)}
        sectionsData={sectionsData}
        earned={1000}
      />
    </Story>
  ))
