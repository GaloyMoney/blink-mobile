import * as React from "react"

import { MockedProvider } from "@apollo/client/testing"
import { Meta } from "@storybook/react"

import { StoryScreen } from "../../../.storybook/views"
import { createCache } from "../../graphql/cache"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"
import { ErrorScreen } from "./error-screen"

export default {
  title: "Error Screen",
  component: ErrorScreen,
  decorators: [(Story) => <StoryScreen>{Story()}</StoryScreen>],
} as Meta<typeof ErrorScreen>

export const Default = () => (
  <MockedProvider mocks={[]} cache={createCache()}>
    <IsAuthedContextProvider value={true}>
      <ErrorScreen resetError={() => {}} error={new Error("test error")} />
    </IsAuthedContextProvider>
  </MockedProvider>
)
