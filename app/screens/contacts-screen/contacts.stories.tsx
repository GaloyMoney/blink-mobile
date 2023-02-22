import * as React from "react"
import { storiesOf } from "@storybook/react-native"
import { StoryScreen, Story, UseCase } from "../../../.storybook/views"
import { ContactsScreen } from "./contacts"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"

const mocks = []

storiesOf("Phone Book", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <MockedProvider mocks={mocks} cache={createCache()}>
    <Story>
      <UseCase text="Dollar" usage="The primary.">
        <ContactsScreen navigation={() => null} />
      </UseCase>
    </Story>
    </MockedProvider>
  ))
