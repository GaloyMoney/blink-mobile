import * as React from "react"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"
import mocks from "../../graphql/mocks"
import { AuthenticationCheckScreen } from "./authentication-check-screen"
import { Meta } from "@storybook/react"
import { AuthenticationContextProvider } from "../../navigation/navigation-container-wrapper"

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
