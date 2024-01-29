import * as React from "react"

import { MockedProvider } from "@apollo/client/testing"
import { Meta } from "@storybook/react"

import { createCache } from "../../graphql/cache"
import mocks from "../../graphql/mocks"
import { AuthenticationContextProvider } from "../../navigation/navigation-container-wrapper"
import { PersistentStateProvider } from "../../store/persistent-state"
import { PinScreen } from "./pin-screen"

export default {
  title: "Pin Screen",
  component: PinScreen,
} as Meta<typeof PinScreen>

const routeAuthenticatePin = {
  key: "pin",
  name: "pin",
  params: {
    screenPurpose: "AuthenticatePin",
  },
} as const

export const AuthenticatePin = () => (
  <PersistentStateProvider>
    <MockedProvider mocks={mocks} cache={createCache()}>
      <AuthenticationContextProvider
        value={{ isAppLocked: true, setAppUnlocked: () => {}, setAppLocked: () => {} }}
      >
        <PinScreen route={routeAuthenticatePin} />
      </AuthenticationContextProvider>
    </MockedProvider>
  </PersistentStateProvider>
)

const routeSetPin = {
  key: "pin",
  name: "pin",
  params: {
    screenPurpose: "SetPin",
  },
} as const

export const SetPin = () => (
  <PersistentStateProvider>
    <MockedProvider mocks={mocks} cache={createCache()}>
      <AuthenticationContextProvider
        value={{ isAppLocked: true, setAppUnlocked: () => {}, setAppLocked: () => {} }}
      >
        <PinScreen route={routeSetPin} />
      </AuthenticationContextProvider>
    </MockedProvider>
  </PersistentStateProvider>
)
