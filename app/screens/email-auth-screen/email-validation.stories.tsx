import React from "react"
import { Meta } from "@storybook/react"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"
import { StoryScreen } from "../../../.storybook/views"
import { EmailValidationScreen } from "./email-validation"

const mocks = []

const route = {
  key: "PhoneValidationScreen",
  name: "phoneValidation",
  params: {
    phone: "+50365055543",
    channel: "SMS",
  },
} as const

export default {
  title: "EmailValidationScreen",
  component: EmailValidationScreen,
  decorators: [
    (Story) => (
      <MockedProvider mocks={mocks} cache={createCache()}>
        <StoryScreen>{Story()}</StoryScreen>
      </MockedProvider>
    ),
  ],
} as Meta<typeof EmailValidationScreen>

export const Main = () => <EmailValidationScreen route={route} />
