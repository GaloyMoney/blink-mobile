import * as React from "react"
import { storiesOf } from "@storybook/react-native"
import { Story, StoryScreen, UseCase } from "../../../storybook/views"
import { LargeButton } from "./large-button"

import MoneyCircle from "./money-circle-02.svg"

declare let module

storiesOf("Large Button", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <UseCase text="Dollar" usage="The primary.">
        <LargeButton
          icon={<MoneyCircle width={75} height={78} />}
          title="Open cash account"
        />
      </UseCase>
    </Story>
  ))
