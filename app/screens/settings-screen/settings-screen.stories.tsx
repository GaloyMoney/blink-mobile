import * as React from "react"
import { StoryScreen } from "../../../.storybook/views"
import { SettingsScreenJSX } from "./settings-screen"
import { ComponentMeta } from "@storybook/react"

export default {
  title: 'Settings Screen',
  component: SettingsScreenJSX,
  decorators: [(Story) => <StoryScreen>{Story()}</StoryScreen>]
} as ComponentMeta<typeof SettingsScreenJSX>

const Template = (args) => <SettingsScreenJSX {...args} navigation={() => {}}
    language={'en'}
    bankName={'Galoy'}
    csvAction={() => {}}
    securityAction={() => {}}
    loadingCsvTransactions={false} />

export const NotLoggedIn = Template.bind({})
NotLoggedIn.args = {isAuthed:false, phone:undefined, username: undefined}

export const LoggedInButNoUsername = Template.bind({})
LoggedInButNoUsername.args = {isAuthed:true, phone:"+16505551234", username: undefined}

export const LoggedInWithUsername = Template.bind({})
LoggedInWithUsername.args = {isAuthed:true, phone:"+16505551234", username: "Joe"}
