import * as React from "react"

import { MockedProvider } from "@apollo/client/testing"
import { Meta } from "@storybook/react"

import { createCache } from "../../graphql/cache"
import mocks from "../../graphql/mocks"
import { AuthenticationContextProvider } from "../../navigation/navigation-container-wrapper"
import { AuthenticationCheckScreen } from "./authentication-check-screen"

export default {
  title: "Authentication Check Screen",
  component: AuthenticationCheckScreen,
} as Meta<typeof AuthenticationCheckScreen>

export const Default = () => (
  <MockedProvider mocks={mocks} cache={createCache()}>
    <AuthenticationContextProvider
      value={{ isAppLocked: true, setAppUnlocked: () => {}, setAppLocked: () => {} }}
    >
      <AuthenticationCheckScreen />
    </AuthenticationContextProvider>
  </MockedProvider>
)
