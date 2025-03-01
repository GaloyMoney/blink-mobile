import React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native"
import { loadLocale } from "@app/i18n/i18n-util.sync"
import { i18nObject } from "@app/i18n/i18n-util"
import {
  Success,
  Queued,
  Pending,
  SuccessLUD09Message,
  SuccessLUD09URL,
  SuccessLUD09URLWithDesc,
  SuccessLUD10AES,
} from "@app/screens/send-bitcoin-screen/send-bitcoin-completed-screen.stories"
import { ContextForScreen } from "./helper"
import { Linking } from "react-native"

jest.mock("react-native-in-app-review", () => ({
  isAvailable: () => true,
  RequestInAppReview: jest.fn(),
}))

describe("SendBitcoinCompletedScreen", () => {
  let LL: ReturnType<typeof i18nObject>

  beforeEach(() => {
    loadLocale("en")
    LL = i18nObject("en")
  })

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

  it("render successAction - LUD 09 - message", async () => {
    const message = "Thanks for your support."

    render(
      <ContextForScreen>
        <SuccessLUD09Message />
      </ContextForScreen>,
    )

    expect(screen.getByText(message)).toBeTruthy()
    expect(screen.getByText(LL.SendBitcoinScreen.note())).toBeTruthy()
  })

  it("render successAction - LUD 09 - URL", async () => {
    const url = "https://es.blink.sv"

    render(
      <ContextForScreen>
        <SuccessLUD09URL />
      </ContextForScreen>,
    )

    const button = screen.getByText(LL.ScanningQRCodeScreen.openLinkTitle())

    expect(button).toBeTruthy()

    fireEvent.press(button)

    expect(Linking.openURL).toHaveBeenCalledWith(url)
  })

  it("render successAction - LUD 09 - URL with description", async () => {
    const url = "https://es.blink.sv"
    const description = "Example URL + description"

    render(
      <ContextForScreen>
        <SuccessLUD09URLWithDesc />
      </ContextForScreen>,
    )

    expect(screen.getByText(description)).toBeTruthy()

    const button = screen.getByText(LL.ScanningQRCodeScreen.openLinkTitle())

    expect(button).toBeTruthy()

    fireEvent.press(button)

    expect(Linking.openURL).toHaveBeenCalledWith(url)
  })

  it("render successAction - LUD 10 - message", async () => {
    const description = "Here is your redeem code"
    const encryptedMessage = "131313"

    render(
      <ContextForScreen>
        <SuccessLUD10AES />
      </ContextForScreen>,
    )

    expect(screen.getByText(description)).toBeTruthy()
    expect(screen.getByText(encryptedMessage)).toBeTruthy()
    expect(screen.getByText(LL.SendBitcoinScreen.note())).toBeTruthy()
  })
})
