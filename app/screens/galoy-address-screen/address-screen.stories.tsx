import * as React from "react"
import { StoryScreen } from "../../../.storybook/views"
import { GaloyAddressScreen } from "./address-screen"
import { Meta } from "@storybook/react"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"
import { createCache } from "../../graphql/cache"
import { AddressScreenDocument } from "../../graphql/generated"
import mocks from "../../graphql/mocks"
import { MockedProvider } from "@apollo/client/testing"

const mocksWithUsername = [
  ...mocks,
  {
    request: {
      query: AddressScreenDocument,
    },
    result: {
      data: {
        me: {
          id: "70df9822-efe0-419c-b864-c9efa99872ea",
          username: "test1",
          __typename: "User",
        },
      },
    },
  },
]

const mocksNoUsername = [
  {
    request: {
      query: AddressScreenDocument,
    },
    result: {
      data: {
        me: {
          id: "70df9822-efe0-419c-b864-c9efa99872ea",
          username: "",
          __typename: "User",
        },
      },
    },
  },
]

export default {
  title: "Address Screen",
  component: GaloyAddressScreen,
  decorators: [(Story) => <StoryScreen>{Story()}</StoryScreen>],
} as Meta<typeof GaloyAddressScreen>

export const LoggedInNoUsername = () => (
  <MockedProvider mocks={mocksNoUsername} cache={createCache()}>
    <IsAuthedContextProvider value={true}>
      <GaloyAddressScreen />
    </IsAuthedContextProvider>
  </MockedProvider>
)

export const LoggedInWithUsername = () => (
  <MockedProvider mocks={mocksWithUsername} cache={createCache()}>
    <IsAuthedContextProvider value={true}>
      <GaloyAddressScreen />
    </IsAuthedContextProvider>
  </MockedProvider>
)
