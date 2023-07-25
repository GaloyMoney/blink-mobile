import { MockedProvider } from "@apollo/client/testing"
import React from "react"
import { StoryScreen } from "../../../.storybook/views"
import { QrCodeComponent } from "./totp-qr"

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

export const Default = () => (
  <QrCodeComponent otpauth={"otpauth://totp/YOUR_IDENTIFICATION?secret=YOUR_SECRET"} />
)
