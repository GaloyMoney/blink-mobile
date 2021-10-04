import * as React from "react"
import { storiesOf } from "@storybook/react-native"
import { StoryScreen } from "../../../storybook/views"
import { ContactsScreen } from "./contacts"
import { reactNavigationDecorator } from "../../../storybook/storybook-navigator"
import { MockedProvider } from "@apollo/client/testing"
import { gql } from "graphql-tag"

const query = gql`
  query contacts {
    me {
      contacts {
        id
        name
        prettyName @client
        transactionsCount
      }
    }
  }
`

const mocks = [
  {
    request: {
      query: query,
    },
    result: {
      data: {
        me: {
          contacts: [
            {
              id: "1",
              name: "MikeP",
              prettyName: "Mike P",
              transactionsCount: "5",
            },
          ],
        },
      },
    },
  },
]

storiesOf("Phone Book", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .addDecorator(reactNavigationDecorator)
  .add("No Contacts", () => (
    <MockedProvider>
      <ContactsScreen navigation={() => null} />
    </MockedProvider>
  ))
  .add("Searchable Contact (Search for 'Mike P'", () => (
    <MockedProvider mocks={mocks}>
      <ContactsScreen navigation={() => null} />
    </MockedProvider>
  ))
