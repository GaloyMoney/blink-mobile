import React from "react"
import { ComponentMeta } from "@storybook/react"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"
import { StoryScreen } from "../../../.storybook/views"
import { PhoneValidationScreen } from "./phone-validation"

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
  title: "PhoneValidationScreen",
  component: PhoneValidationScreen,
  decorators: [
    (Story) => (
      <MockedProvider mocks={mocks} cache={createCache()}>
        <StoryScreen>{Story()}</StoryScreen>
      </MockedProvider>
    ),
  ],
} as ComponentMeta<typeof PhoneValidationScreen>

export const Main = () => <PhoneValidationScreen route={route} />
