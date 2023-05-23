import * as React from "react"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"
import mocks from "../../graphql/mocks"
import { AuthenticationScreen } from "./authentication-screen"
import { Meta } from "@storybook/react"
import { AuthenticationContextProvider } from "../../navigation/navigation-container-wrapper"
import { AuthenticationScreenPurpose } from "../../utils/enum"
import { PersistentStateProvider } from "../../store/persistent-state"

export default {
  title: "Authentication Screen",
  component: AuthenticationScreen,
} as Meta<typeof AuthenticationScreen>

const route = {
  key: "authentication",
  name: "authentication",
  params: {
    screenPurpose: AuthenticationScreenPurpose.Authenticate,
    isPinEnabled: true,
  },
} as const

export const Default = () => (
  <PersistentStateProvider>
    <MockedProvider mocks={mocks} cache={createCache()}>
      <AuthenticationContextProvider
        value={{ isAppLocked: true, setAppUnlocked: () => {}, setAppLocked: () => {} }}
      >
        <AuthenticationScreen route={route} />
      </AuthenticationContextProvider>
    </MockedProvider>
  </PersistentStateProvider>
)
