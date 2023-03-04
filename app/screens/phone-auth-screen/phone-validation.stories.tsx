import React from "react"
import { ComponentMeta } from "@storybook/react"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"
import { PersistentStateWrapper, StoryScreen } from "../../../.storybook/views"
import { PhoneValidationScreen } from "./phone-validation"

const mocks = []

const route = {
  key: "PhoneValidationScreen",
  name: "phoneValidation",
  params: {
    phone: "+50365055543",
  },
} as const

export default {
  title: "PhoneValidationScreen",
  component: PhoneValidationScreen,
  decorators: [
    (Story) => (
      <PersistentStateWrapper>
        <MockedProvider mocks={mocks} cache={createCache()}>
          <StoryScreen>{Story()}</StoryScreen>
        </MockedProvider>
      </PersistentStateWrapper>
    ),
  ],
} as ComponentMeta<typeof PhoneValidationScreen>

export const Main = () => <PhoneValidationScreen route={route} />
