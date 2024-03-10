import React from "react"

import { MockedProvider } from "@apollo/client/testing"
import { Meta } from "@storybook/react"

import { StoryScreen } from "../../../.storybook/views"
import { createCache } from "../../graphql/cache"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"
import mocks from "../../graphql/mocks"
import { BalanceHeader } from "./balance-header"

export default {
  title: "Balance Header",
  component: BalanceHeader,
  decorators: [
    (Story) => (
      <MockedProvider mocks={mocks} cache={createCache()}>
        <StoryScreen>{Story()}</StoryScreen>
      </MockedProvider>
    ),
  ],
} as Meta<typeof BalanceHeader>

export const Unauthed = () => (
  <IsAuthedContextProvider value={false}>
    <BalanceHeader
      loading={false}
      isContentVisible={true}
      setIsContentVisible={() => {}}
    />
  </IsAuthedContextProvider>
)

export const Authed = () => (
  <IsAuthedContextProvider value={true}>
    <BalanceHeader
      loading={false}
      isContentVisible={true}
      setIsContentVisible={() => {}}
    />
  </IsAuthedContextProvider>
)

export const Loading = () => (
  <IsAuthedContextProvider value={true}>
    <BalanceHeader
      loading={true}
      isContentVisible={true}
      setIsContentVisible={() => {}}
    />
  </IsAuthedContextProvider>
)

export const Hidden = () => (
  <IsAuthedContextProvider value={true}>
    <BalanceHeader
      loading={false}
      isContentVisible={false}
      setIsContentVisible={() => {}}
    />
  </IsAuthedContextProvider>
)
