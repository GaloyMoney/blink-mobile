import * as React from "react"
import { storiesOf } from "@storybook/react-native"
import { StoryScreen, Story, UseCase } from "../../../.storybook/views"
import { ContactsDetailScreenJSX } from "./contacts-detail"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"

const contact = {
  id: "MikeP",
  username: "MikeP",
  name: "Mike Peterson",
  transactionsCount: 10,
}

const mocks = []

storiesOf("Contact Detail", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Contact default", () => (
    <MockedProvider mocks={mocks} cache={createCache()}>
      <Story>
        <UseCase text="Contact 1" usage="The primary.">
          <ContactsDetailScreenJSX contact={contact} />
        </UseCase>
      </Story>
    </MockedProvider>
  ))
