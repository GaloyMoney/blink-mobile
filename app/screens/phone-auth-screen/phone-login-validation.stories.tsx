import React from "react"

import { MockedProvider } from "@apollo/client/testing"
import { Meta } from "@storybook/react"

import { StoryScreen } from "../../../.storybook/views"
import { createCache } from "../../graphql/cache"
import { PhoneLoginValidationScreen } from "./phone-login-validation"

const mocks = []

const route = {
  key: "PhoneLoginValidationScreen",
  name: "phoneLoginValidate",
  params: {
    type: "CreateAccount",
    phone: "+50365055543",
    channel: "SMS",
  },
} as const

export default {
  title: "PhoneLoginValidationScreen",
  component: PhoneLoginValidationScreen,
  decorators: [
    (Story) => (
      <MockedProvider mocks={mocks} cache={createCache()}>
        <StoryScreen>{Story()}</StoryScreen>
      </MockedProvider>
    ),
  ],
} as Meta<typeof PhoneLoginValidationScreen>

export const Main = () => <PhoneLoginValidationScreen route={route} />
