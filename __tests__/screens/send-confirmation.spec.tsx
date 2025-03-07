import React from "react"
import { act, render, screen } from "@testing-library/react-native"
import { loadLocale } from "@app/i18n/i18n-util.sync"
import { i18nObject } from "@app/i18n/i18n-util"
import {
  Intraledger,
  LightningLnURL,
} from "@app/screens/send-bitcoin-screen/send-bitcoin-confirmation-screen.stories"
import { ContextForScreen } from "./helper"

jest.mock("@app/graphql/generated", () => ({
  ...jest.requireActual("@app/graphql/generated"),
  useSendBitcoinConfirmationScreenQuery: jest.fn(() => ({
    data: {
      me: {
        id: "mocked-user-id",
        defaultAccount: {
          id: "mocked-account-id",
          wallets: [
            {
              id: "btc-wallet-id",
              balance: 500000,
              walletCurrency: "BTC",
            },
            {
              id: "usd-wallet-id",
              balance: 10000,
              walletCurrency: "USD",
            },
          ],
        },
      },
    },
  })),
}))

describe("SendBitcoinConfirmationScreen", () => {
  let LL: ReturnType<typeof i18nObject>

  beforeEach(() => {
    loadLocale("en")
    LL = i18nObject("en")
  })

  it("Send Screen Confirmation - Intraledger Payment", async () => {
    const { findByLabelText } = render(
      <ContextForScreen>
        <Intraledger />
      </ContextForScreen>,
    )

    // it seems we need multiple act because the component re-render multiple times
    // probably this could be debug with why-did-you-render
    await act(
      () =>
        new Promise((resolve) => {
          setTimeout(resolve, 10)
        }),
    )

    const { children } = await findByLabelText("Successful Fee")
    expect(children).toEqual(["₦0 ($0.00)"])
  })

  it("Send Screen Confirmation - Lightning lnurl Payment", async () => {
    const lnurl = "lnurl1dp68gurn8ghj7mr..."

    render(
      <ContextForScreen>
        <LightningLnURL />
      </ContextForScreen>,
    )

    await act(
      () =>
        new Promise((resolve) => {
          setTimeout(resolve, 10)
        }),
    )

    expect(screen.getByText(lnurl)).toBeTruthy()
    expect(screen.getByText("₦100 ($100.00)")).toBeTruthy()
    expect(screen.getByTestId("slider")).toBeTruthy()
    expect(LL.SendBitcoinConfirmationScreen.slideToConfirm()).toBeTruthy()
  })
})
