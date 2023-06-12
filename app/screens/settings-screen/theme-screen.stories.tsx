import * as React from "react"
import { StoryScreen } from "../../../.storybook/views"
import { ThemeScreen } from "./theme-screen"
import { Meta } from "@storybook/react"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"

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
