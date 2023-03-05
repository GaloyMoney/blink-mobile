import React from "react"

import { render } from "@testing-library/react-native"
import { ContextForScreen } from "./helper"
import ReceiveWrapperScreen from "@app/screens/receive-bitcoin-screen/receive-wrapper"

it("Receive", () => {
  render(
    <ContextForScreen>
      <ReceiveWrapperScreen />
    </ContextForScreen>,
  )
})
