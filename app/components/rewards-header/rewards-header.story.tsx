import * as React from "react"
import { storiesOf } from "@storybook/react-native"
import { StoryScreen, Story, UseCase } from "../../../storybook/views"
import { RewardsHeader } from "./"

import { withKnobs, number, boolean } from "@storybook/addon-knobs";

// import { action } from '@storybook/addon-actions'

declare let module

storiesOf("RewardsHeader", module)
  .addDecorator(withKnobs)
  .addDecorator(fn => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <UseCase text="Dollar" usage="The primary.">
        <RewardsHeader isRewardOpen={false} balance={number("Amount", 35)} />
      </UseCase>
      <UseCase text="Dollar" usage="The primary.">
        <RewardsHeader isRewardOpen={false} balance={number("Amount", 35)} />
      </UseCase>
      <UseCase text="Sat" usage="isRewardOpen true">
        <RewardsHeader isRewardOpen={boolean("isRewardOpen", false)} balance={number("Amount", 35)} />
      </UseCase>
    </Story>
  ))

