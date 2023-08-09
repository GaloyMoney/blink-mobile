import * as React from "react"
import { Story, UseCase } from "../../../../.storybook/views"
import { ContactsDetailScreenJSX } from "./contacts-detail"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../../graphql/cache"

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
