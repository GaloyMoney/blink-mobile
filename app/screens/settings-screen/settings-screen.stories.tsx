import { withKnobs, boolean, text } from "@storybook/addon-knobs"
import { storiesOf } from "@storybook/react-native"
import * as React from "react"
import { StoryScreen } from "../../../storybook/views"
import { SettingsScreenJSX } from "./settings-screen"
import { reactNavigationDecorator } from "../../../storybook/storybook-navigator"

declare let module

storiesOf("Settings screen", module)
  .addDecorator(withKnobs)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .addDecorator(reactNavigationDecorator)
  .add("Settings Screen - Dynamic", () => (
    <SettingsScreenJSX
      phone={text("phone", "+14027658493")}
      username={text("username", "storybookUser")}
      notificationsEnabled={boolean("notificationsEnabled", false)}
      walletIsActive={boolean("walletIsActive", false)}
      navigation={{ navigate: () => null }}
    />
  ))
