import * as React from "react"
import { storiesOf } from "@storybook/react-native"
import { StoryScreen, Story, UseCase } from "../../../storybook/views"
import { RewardsHeader } from "./"

import { withKnobs, number } from "@storybook/addon-knobs";
import { Animated } from "react-native";

// import { action } from '@storybook/addon-actions'

const animation0 = new Animated.Value(0)
const animation05 = new Animated.Value(0.5)
const animation1 = new Animated.Value(1)

declare let module

storiesOf("RewardsHeader", module)
  .addDecorator(withKnobs)
  .addDecorator(fn => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <UseCase text="Dollar" usage="The primary.">
        <RewardsHeader isRewardOpen={false} balance={number("Amount", 35)} />
      </UseCase>
      <UseCase text="Sat" usage="isRewardOpen={true} animation0">
        <RewardsHeader isRewardOpen={true} balance={number("Amount", 35)} animation={animation05} />
      </UseCase>
    </Story>
  ))

