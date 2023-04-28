import { MockedProvider } from "@apollo/client/testing"
import { ComponentMeta } from "@storybook/react"
import React from "react"
import { StoryScreen } from "../../../.storybook/views"
import { createCache } from "../../graphql/cache"
import { SetUpLiteDeviceAccountScreen } from "./lite-account"
import mocks from "../../graphql/mocks"

export default {
  title: "Lite Device Account screen",
  component: SetUpLiteDeviceAccountScreen,
  decorators: [
    (Story) => (
      <MockedProvider mocks={mocks} cache={createCache()}>
        <StoryScreen>{Story()}</StoryScreen>
      </MockedProvider>
    ),
  ],
} as ComponentMeta<typeof SetUpLiteDeviceAccountScreen>

const route = {
  key: "liteDeviceAccount",
  name: "liteDeviceAccount",
  params: {
    deviceToken: "faketoken",
  },
} as const

export const Default = () => <SetUpLiteDeviceAccountScreen route={route}/>
