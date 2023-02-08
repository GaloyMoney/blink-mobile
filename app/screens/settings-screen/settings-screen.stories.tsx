import * as React from "react"
import { StoryScreen } from "../../../.storybook/views"
import { SettingsScreenJSX } from "./settings-screen"

export default {
  title: 'Settings screen',
  component: SettingsScreenJSX,
};

const Template = (args) => <StoryScreen>
  <SettingsScreenJSX {...args} navigation={() => {}}
    language={'en'}
    bankName={'Galoy'}
    csvAction={() => {}}
    securityAction={() => {}}
    loadingCsvTransactions={false} />
</StoryScreen>

export const NotLoggedIn = Template.bind({})
NotLoggedIn.args = {isAuthed:false, phone:undefined, username: undefined}

export const LoggedInButNoUsername = Template.bind({})
LoggedInButNoUsername.args = {isAuthed:true, phone:"+16505551234", username: undefined}

export const LoggedInWithUsername = Template.bind({})
LoggedInWithUsername.args = {isAuthed:true, phone:"+16505551234", username: "Joe"}
