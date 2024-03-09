import React from "react"

import { MockedProvider } from "@apollo/client/testing"
import { Meta } from "@storybook/react"

import { StoryScreen } from "../../../.storybook/views"
import { createCache } from "../../graphql/cache"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"
import mocks from "../../graphql/mocks"
import { HomeScreen } from "./home-screen"

export default {
  title: "Home Screen",
  component: HomeScreen,
  decorators: [
    (Story) => (
      <MockedProvider mocks={mocks} cache={createCache()}>
        <StoryScreen>{Story()}</StoryScreen>
      </MockedProvider>
    ),
  ],
} as Meta<typeof HomeScreen>

export const Unauthed = () => (
  <IsAuthedContextProvider value={false}>
    <HomeScreen />
  </IsAuthedContextProvider>
)
export const Authed = () => (
  <IsAuthedContextProvider value={true}>
    <HomeScreen />
  </IsAuthedContextProvider>
)
