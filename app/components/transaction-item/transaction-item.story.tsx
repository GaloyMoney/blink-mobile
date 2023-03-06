import React from "react"
import { Text } from "react-native"
import { ComponentMeta } from "@storybook/react"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"
import { PersistentStateWrapper, StoryScreen } from "../../../.storybook/views"
import { TransactionItem } from "./transaction-item"

const mocks = []

const route = {
  key: "PhoneValidationScreen",
  name: "phoneValidation",
  params: {
    phone: "+50365055543",
  },
} as const

export default {
  title: "Transaction Item",
  component: TransactionItem,
  decorators: [
    (Story) => (
      <PersistentStateWrapper>
        <MockedProvider mocks={mocks} cache={createCache()}>
          <StoryScreen>{Story()}</StoryScreen>
        </MockedProvider>
      </PersistentStateWrapper>
    ),
  ],
} as ComponentMeta<typeof TransactionItem>

export const Main = () => {
    return <Text>Hello world</Text>
}
