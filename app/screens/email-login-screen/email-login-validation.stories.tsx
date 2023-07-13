import React from "react"
import { Meta } from "@storybook/react"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"
import { StoryScreen } from "../../../.storybook/views"
import { EmailLoginValidationScreen } from "./email-login-validation"

const mocks = []

const route = {
  key: "EmailLoginValidationScreen",
  name: "emailLoginValidation",
  params: {
    phone: "+50365055543",
    channel: "SMS",
  },
} as const

export default {
  title: "EmailLoginValidationScreen",
  component: EmailLoginValidationScreen,
  decorators: [
    (Story) => (
      <MockedProvider mocks={mocks} cache={createCache()}>
        <StoryScreen>{Story()}</StoryScreen>
      </MockedProvider>
    ),
  ],
} as Meta<typeof EmailLoginValidationScreen>

export const Main = () => <EmailLoginValidationScreen route={route} />
