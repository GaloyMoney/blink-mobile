import React from "react"
import { Meta } from "@storybook/react"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"
import { StoryScreen } from "../../../.storybook/views"
import { EmailLoginValidateScreen } from "./email-login-validate"

const mocks = []

const route = {
  key: "EmailLoginValidateScreen",
  name: "emailLoginValidate",
  params: {
    phone: "+50365055543",
    channel: "SMS",
  },
} as const

export default {
  title: "EmailLoginValidateScreen",
  component: EmailLoginValidateScreen,
  decorators: [
    (Story) => (
      <MockedProvider mocks={mocks} cache={createCache()}>
        <StoryScreen>{Story()}</StoryScreen>
      </MockedProvider>
    ),
  ],
} as Meta<typeof EmailLoginValidateScreen>

export const Main = () => <EmailLoginValidateScreen route={route} />
