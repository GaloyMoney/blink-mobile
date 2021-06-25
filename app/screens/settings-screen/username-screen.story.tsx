import { withKnobs } from "@storybook/addon-knobs"
import { storiesOf } from "@storybook/react-native"
import * as React from "react"
import { StoryScreen } from "../../../storybook/views"
import { UsernameScreen } from "./username-screen"

declare let module

storiesOf("Set username", module)
  .addDecorator(withKnobs)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Default", () => <UsernameScreen />)
