import React from "react"
import { HomeScreen } from "./home-screen"
import { PersistentStateWrapper, StoryScreen } from "../../../.storybook/views"
import { ComponentMeta } from "@storybook/react"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"
import mocks from "../../graphql/mocks"

export default {
  title: "Home Screen",
  component: HomeScreen,
  decorators: [
    (Story) => (
      <PersistentStateWrapper>
        <MockedProvider mocks={mocks} cache={createCache()}>
          <StoryScreen>{Story()}</StoryScreen>
        </MockedProvider>
      </PersistentStateWrapper>
    ),
  ],
} as ComponentMeta<typeof HomeScreen>

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
