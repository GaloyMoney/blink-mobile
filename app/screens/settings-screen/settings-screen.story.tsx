import { withKnobs } from "@storybook/addon-knobs"
import { storiesOf } from "@storybook/react-native"
import * as React from "react"
import { StoryScreen } from "../../../storybook/views"
import { SettingsScreenJSX } from "./settings-screen"
import { action } from "@storybook/addon-actions"

declare let module

const propsDefault = {
  navigation: action("navigate"),
  language: "en",
  bankName: "Galoy",
  csvAction: () => {},
  securityAction: () => {},
  loadingCsvTransactions: false,
}

storiesOf("Settings screen", module)
  .addDecorator(withKnobs)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Not logged in", () => <SettingsScreenJSX isAuthed={false} phone={undefined} username={undefined} {...propsDefault} />)
  .add("Logged in but not username", () => (
    <SettingsScreenJSX phone="+16505551234" isAuthed={true} username={undefined} {...propsDefault} />
  ))
  .add("Logged in with username", () => (
    <SettingsScreenJSX
      {...propsDefault}
      isAuthed={true}
      phone="+16505551234"
      username="Joe"
    />
  ))
