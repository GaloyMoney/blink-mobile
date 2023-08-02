import { MockedProvider } from "@apollo/client/testing"
import React from "react"
import { StoryScreen } from "../../../.storybook/views"
import { CopySecretComponent } from "./totp-copy"

export default {
  title: "Totp Clipboard",
  decorators: [
    (Story) => (
      <MockedProvider>
        <StoryScreen>{Story()}</StoryScreen>
      </MockedProvider>
    ),
  ],
}

export const Default = () => (
  <CopySecretComponent secret={"6HDPV6SFUMTJ75WP3G5UICAI6N4KWQFN"} />
)
