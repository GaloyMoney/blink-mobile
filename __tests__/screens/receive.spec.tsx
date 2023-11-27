import React from "react"

import { act, render } from "@testing-library/react-native"
import { ContextForScreen } from "./helper"
import ReceiveScreen from "@app/screens/receive-bitcoin-screen/receive-screen"

jest.mock("react-native-nfc-manager", () => {
  return {
    NfcManager: {
      start: jest.fn(),
      stop: jest.fn(),
    },
    isSupported: jest.fn(),
  }
})

it("Receive", async () => {
  render(
    <ContextForScreen>
      <ReceiveScreen />
    </ContextForScreen>,
  )
  await act(async () => {})
  await act(async () => {})
})
