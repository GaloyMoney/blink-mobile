import { MockedProvider } from "@apollo/client/testing"
import React from "react"
import { StoryScreen } from "../../../.storybook/views"
import { TotpQr } from "./totp-qr"

export default {
  title: "Totp QR",
  decorators: [
    (Story) => (
      <MockedProvider>
        <StoryScreen>{Story()}</StoryScreen>
      </MockedProvider>
    ),
  ],
}

export const Default = () => <TotpQr secret={"6HDPV6SFUMTJ75WP3G5UICAI6N4KWQFN"} />
