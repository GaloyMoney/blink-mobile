import * as React from "react"

import { MockedProvider } from "@apollo/client/testing"
import { Meta } from "@storybook/react"

import { StoryScreen } from "../../../.storybook/views"
import { createCache } from "../../graphql/cache"
import { ThemeScreen } from "./theme-screen"

export default {
  title: "Theme Screen",
  component: ThemeScreen,
  decorators: [(Story) => <StoryScreen>{Story()}</StoryScreen>],
} as Meta<typeof ThemeScreen>

export const Default = () => (
  <MockedProvider cache={createCache()}>
    <ThemeScreen />
  </MockedProvider>
)
