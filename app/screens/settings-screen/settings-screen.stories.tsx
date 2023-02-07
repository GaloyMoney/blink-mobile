import { withKnobs } from "@storybook/addon-knobs"
import { storiesOf } from "@storybook/react-native"
import * as React from "react"
import { StoryScreen } from "../../../.storybook/views"
import { SettingsScreenJSX } from "./settings-screen"
import { action } from "@storybook/addon-actions"

export default {
  title: 'Settings screen',
  component: SettingsScreenJSX,
};

const propsDefault = {
  navigation: () => {},
  language: 'en',
  bankName: 'Galoy',
  csvAction: () => {},
  securityAction: () => {},
  loadingCsvTransactions: false,
};

export const NotLoggedIn = () => (<StoryScreen>
    <SettingsScreenJSX isAuthed={false} phone={undefined} username={undefined} {...propsDefault} />
  </StoryScreen>)

export const LoggedInButNoUsername = () => (<StoryScreen>
  <SettingsScreenJSX phone="+16505551234" isAuthed={true} username={undefined} {...propsDefault} />
    </StoryScreen>)

export const LoggedInWithUsername = () =>  (<StoryScreen>
    <SettingsScreenJSX isAuthed={true} phone="+16505551234" username="Joe" {...propsDefault} />
  </StoryScreen>)
