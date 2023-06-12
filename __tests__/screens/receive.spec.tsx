import React from "react"

import { act, render } from "@testing-library/react-native"
import { ContextForScreen } from "./helper"
import ReceiveWrapperScreen from "@app/screens/receive-bitcoin-screen/receive-wrapper"

it("Receive", async () => {
  render(
    <ContextForScreen>
      <ReceiveWrapperScreen />
    </ContextForScreen>,
  )
  await act(async () => {})
  await act(async () => {})
})
