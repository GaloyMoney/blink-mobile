import * as React from "react"

import { MockedProvider } from "@apollo/client/testing"
import { Meta } from "@storybook/react"

import { StoryScreen } from "../../../.storybook/views"
import { createCache } from "../../graphql/cache"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"
import SendBitcoinCompletedScreen from "./send-bitcoin-completed-screen"

export default {
  title: "Send Bitcoin Completed Screen",
  component: SendBitcoinCompletedScreen,
  decorators: [(Story) => <StoryScreen>{Story()}</StoryScreen>],
} as Meta<typeof SendBitcoinCompletedScreen>

const successRoute = {
  key: "sendBitcoinCompleted",
  name: "sendBitcoinCompleted",
  params: {
    status: "SUCCESS",
    arrivalAtMempoolEstimate: undefined,
    successAction: undefined,
    preimage: undefined,
  },
} as const

export const Success = () => (
  <MockedProvider mocks={[]} cache={createCache()}>
    <IsAuthedContextProvider value={true}>
      <SendBitcoinCompletedScreen route={successRoute} />
    </IsAuthedContextProvider>
  </MockedProvider>
)

const queuedRoute = {
  key: "sendBitcoinCompleted",
  name: "sendBitcoinCompleted",
  params: {
    status: "PENDING",
    arrivalAtMempoolEstimate: 10000,
    successAction: undefined,
    preimage: undefined,
  },
} as const

export const Queued = () => (
  <MockedProvider mocks={[]} cache={createCache()}>
    <IsAuthedContextProvider value={true}>
      <SendBitcoinCompletedScreen route={queuedRoute} />
    </IsAuthedContextProvider>
  </MockedProvider>
)

const pendingRoute = {
  key: "sendBitcoinCompleted",
  name: "sendBitcoinCompleted",
  params: {
    status: "PENDING",
    arrivalAtMempoolEstimate: undefined,
    successAction: undefined,
    preimage: undefined,
  },
} as const

export const Pending = () => (
  <MockedProvider mocks={[]} cache={createCache()}>
    <IsAuthedContextProvider value={true}>
      <SendBitcoinCompletedScreen route={pendingRoute} />
    </IsAuthedContextProvider>
  </MockedProvider>
)

const successLUD09MessageRoute = {
  key: "sendBitcoinCompleted",
  name: "sendBitcoinCompleted",
  params: {
    status: "SUCCESS",
    arrivalAtMempoolEstimate: undefined,
    successAction: {
      tag: "message",
      description: "",
      url: null,
      message: "Thanks for your support.",
      ciphertext: null,
      iv: null,
      decipher: () => null,
    },
    preimage: undefined,
  },
} as const

export const SuccessLUD09Message = () => (
  <MockedProvider mocks={[]} cache={createCache()}>
    <IsAuthedContextProvider value={true}>
      <SendBitcoinCompletedScreen route={successLUD09MessageRoute} />
    </IsAuthedContextProvider>
  </MockedProvider>
)

const successLUD09URLRoute = {
  key: "sendBitcoinCompleted",
  name: "sendBitcoinCompleted",
  params: {
    status: "SUCCESS",
    arrivalAtMempoolEstimate: undefined,
    successAction: {
      tag: "url",
      description: null,
      url: "https://es.blink.sv",
      message: null,
      ciphertext: null,
      iv: null,
      decipher: () => null,
    },
    preimage: undefined,
  },
} as const

export const SuccessLUD09URL = () => (
  <MockedProvider mocks={[]} cache={createCache()}>
    <IsAuthedContextProvider value={true}>
      <SendBitcoinCompletedScreen route={successLUD09URLRoute} />
    </IsAuthedContextProvider>
  </MockedProvider>
)

const successLUD09URLWithDescRoute = {
  key: "sendBitcoinCompleted",
  name: "sendBitcoinCompleted",
  params: {
    status: "SUCCESS",
    arrivalAtMempoolEstimate: undefined,
    successAction: {
      tag: "url",
      description: "Example URL + description",
      url: "https://es.blink.sv",
      message: null,
      ciphertext: null,
      iv: null,
      decipher: () => null,
    },
    preimage: undefined,
  },
} as const

export const SuccessLUD09URLWithDesc = () => (
  <MockedProvider mocks={[]} cache={createCache()}>
    <IsAuthedContextProvider value={true}>
      <SendBitcoinCompletedScreen route={successLUD09URLWithDescRoute} />
    </IsAuthedContextProvider>
  </MockedProvider>
)
