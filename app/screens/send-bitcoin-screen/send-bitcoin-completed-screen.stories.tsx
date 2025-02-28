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

const successLUD10AESRoute = {
  key: "sendBitcoinCompleted",
  name: "sendBitcoinCompleted",
  params: {
    status: "SUCCESS",
    arrivalAtMempoolEstimate: undefined,
    successAction: {
      tag: "aes",
      description: "Here is your redeem code",
      url: null,
      message: null,
      ciphertext: "564u3BEMRefWUV1098gJ5w==",
      iv: "IhkC5ktKB9LG91FvlbN2kg==",
      decipher: () => null,
    },
    preimage: "25004cd52960a3bac983e3f95c432341a7052cef37b9253b0b0b1256d754559b",
  },
} as const

export const SuccessLUD10AES = () => (
  <MockedProvider mocks={[]} cache={createCache()}>
    <IsAuthedContextProvider value={true}>
      <SendBitcoinCompletedScreen route={successLUD10AESRoute} />
    </IsAuthedContextProvider>
  </MockedProvider>
)
