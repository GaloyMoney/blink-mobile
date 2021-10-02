import { withKnobs } from "@storybook/addon-knobs"
import { storiesOf } from "@storybook/react-native"
import * as React from "react"
import { StoryScreen } from "../../../storybook/views"
import { SettingsScreenJSX } from "./settings-screen"

declare let module

storiesOf("Settings screen", module)
  .addDecorator(withKnobs)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Not logged in", () => <SettingsScreenJSX loggedin={false} />)
  .add("Logged in but not username", () => (
    <SettingsScreenJSX phone="+16505551234" notifications="enabled" loggedin />
  ))
  .add("Logged in with username", () => (
    <SettingsScreenJSX
      phone="+16505551234"
      username="Joe"
      notifications="enabled"
      loggedin
    />
  ))
