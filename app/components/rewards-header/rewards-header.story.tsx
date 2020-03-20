import * as React from "react"
import { storiesOf } from "@storybook/react-native"
import { StoryScreen, Story, UseCase } from "../../../storybook/views"
import { RewardsHeader } from "./"
import { Animated } from "react-native"

import { withKnobs, text, boolean, number } from "@storybook/addon-knobs";

// import { action } from '@storybook/addon-actions'

const animation0 = new Animated.Value(0)
const animation05 = new Animated.Value(0.5)
const animation1 = new Animated.Value(1)

declare let module

storiesOf("RewardsHeader", module)
  .addDecorator(fn => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <UseCase text="Dollar" usage="The primary.">
        <RewardsHeader isRewardOpen={false} balance={number("Age", 35)} />
      </UseCase>
      {/* <UseCase text="Sat" usage="isRewardOpen={true} animation0">
        <RewardsHeader isRewardOpen={true} balance={150} animation={animation0} />
      </UseCase>
      <UseCase text="Sat" usage="isRewardOpen={true} animation05">
        <RewardsHeader isRewardOpen={true} balance={150} animation={animation05} />
      </UseCase>
      <UseCase text="Sat" usage="isRewardOpen={true} animation1">
        <RewardsHeader isRewardOpen={true} balance={150} animation={animation1} />
      </UseCase> */}
    </Story>
  ))

export default {
    title: "Storybook Knobs",
    decorators: [withKnobs]
};