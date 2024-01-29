import * as React from "react"

import { MockedProvider } from "@apollo/client/testing"
import { Meta } from "@storybook/react"

import { StoryScreen } from "../../../.storybook/views"
import { createCache } from "../../graphql/cache"
import { LanguageDocument } from "../../graphql/generated"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"
import { LanguageScreen } from "./language-screen"

const mocks = [
  {
    request: {
      query: LanguageDocument,
    },
    result: {
      data: {
        me: {
          id: "70df9822-efe0-419c-b864-c9efa99872ea",
          language: "",
          __typename: "User",
        },
      },
    },
  },
]

export default {
  title: "Language Screen",
  component: LanguageScreen,
  decorators: [(Story) => <StoryScreen>{Story()}</StoryScreen>],
} as Meta<typeof LanguageScreen>

export const Default = () => (
  <MockedProvider mocks={mocks} cache={createCache()}>
    <IsAuthedContextProvider value={false}>
      <LanguageScreen />
    </IsAuthedContextProvider>
  </MockedProvider>
)
