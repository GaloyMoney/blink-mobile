import React from "react"
import { render, screen, waitFor } from "@testing-library/react-native"
import { loadLocale } from "@app/i18n/i18n-util.sync"

import {
  Success,
  Queued,
  Pending,
} from "../../app/screens/send-bitcoin-screen/send-bitcoin-completed-screen.stories"
import { ContextForScreen } from "./helper"

jest.mock("react-native-in-app-review", () => ({
  isAvailable: () => true,
  RequestInAppReview: jest.fn(),
}))

describe("SendBitcoinCompletedScreen", () => {
  beforeEach(() => loadLocale("en"))

  it("renders the Success state correctly", async () => {
    render(
      <ContextForScreen>
        <Success />
      </ContextForScreen>,
    )

    const successTextElement = await waitFor(() => screen.findByTestId("Success Text"))
    expect(successTextElement.props.children).toContain(
      "Payment has been sent successfully",
    )
  })

  it("renders the Queued state correctly", async () => {
    render(
      <ContextForScreen>
        <Queued />
      </ContextForScreen>,
    )

    const queuedTextElement = await waitFor(() => screen.findByTestId("Success Text"))
    expect(queuedTextElement.props.children).toEqual(
      expect.stringContaining("Your transaction is queued"),
    )
  })

  it("renders the Pending state correctly", async () => {
    render(
      <ContextForScreen>
        <Pending />
      </ContextForScreen>,
    )

    const pendingTextElement = await waitFor(() => screen.findByTestId("Success Text"))
    expect(pendingTextElement.props.children).toEqual(
      expect.stringContaining("The payment has been sent"),
    )
  })
})
