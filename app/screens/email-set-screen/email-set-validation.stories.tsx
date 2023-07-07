import React from "react"
import { Meta } from "@storybook/react"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"
import { StoryScreen } from "../../../.storybook/views"
import { EmailSetValidationScreen } from "./email-set-validation"

const mocks = []

const route = {
  key: "EmailSetValidationScreen",
  name: "emailSetValidation",
  params: {
    phone: "+50365055543",
    channel: "SMS",
  },
} as const

export default {
  title: "EmailSetValidationScreen",
  component: EmailSetValidationScreen,
  decorators: [
    (Story) => (
      <MockedProvider mocks={mocks} cache={createCache()}>
        <StoryScreen>{Story()}</StoryScreen>
      </MockedProvider>
    ),
  ],
} as Meta<typeof EmailSetValidationScreen>

export const Main = () => <EmailSetValidationScreen route={route} />
