import * as React from "react"

import { MockedProvider } from "@apollo/client/testing"

import { Story, UseCase } from "../../../../.storybook/views"
import { createCache } from "../../../graphql/cache"
import { ContactsDetailScreenJSX } from "./contacts-detail"

const contact = {
  id: "MikeP",
  username: "MikeP",
  name: "Mike Peterson",
  transactionsCount: 10,
}

const mocks = []

export default {
  title: "Contact Detail",
  component: ContactsDetailScreenJSX,
  decorators: [
    (Story) => (
      <MockedProvider mocks={mocks} cache={createCache()}>
        <Story />
      </MockedProvider>
    ),
  ],
}

export const Default = () => (
  <Story>
    <UseCase text="Contact 1" usage="The primary.">
      <ContactsDetailScreenJSX contact={contact} />
    </UseCase>
  </Story>
)
