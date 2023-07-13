import React from "react"
import { Meta } from "@storybook/react"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"
import { StoryScreen } from "../../../.storybook/views"
import { EmailRegistrationValidateScreen } from "./email-registration-validate"

const mocks = []

const route = {
  key: "EmailRegistrationValidateScreen",
  name: "emailRegistrationValidate",
  params: {
    phone: "+50365055543",
    channel: "SMS",
  },
} as const

export default {
  title: "EmailRegistrationValidateScreen",
  component: EmailRegistrationValidateScreen,
  decorators: [
    (Story) => (
      <MockedProvider mocks={mocks} cache={createCache()}>
        <StoryScreen>{Story()}</StoryScreen>
      </MockedProvider>
    ),
  ],
} as Meta<typeof EmailRegistrationValidateScreen>

export const Main = () => <EmailRegistrationValidateScreen route={route} />
