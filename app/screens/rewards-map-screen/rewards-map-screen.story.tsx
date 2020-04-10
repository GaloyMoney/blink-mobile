import { number, withKnobs } from "@storybook/addon-knobs";
import { storiesOf } from "@storybook/react-native";
import * as React from "react";
import { Story, StoryScreen } from "../../../storybook/views";
import { RewardsMapScreen } from "./rewards-map-screen";


declare let module

storiesOf("Map", module)
  .addDecorator(withKnobs)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <RewardsMapScreen currSection={number("section", 0)} />
    </Story>
))
