import * as React from "react"
import { storiesOf } from "@storybook/react-native"
import { StoryScreen, Story, UseCase } from "../../../storybook/views"
import { SplashScreen } from "./splash-screen"

declare let module

storiesOf("SplashScreen", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <UseCase text="Dollar" usage="The primary.">
        <SplashScreen />
      </UseCase>
    </Story>
  ))
