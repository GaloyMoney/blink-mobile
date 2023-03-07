import React from "react"

import { render } from "@testing-library/react-native"
import { ContextForScreen } from "./helper"

import { Intraledger } from "../../app/screens/send-bitcoin-screen/send-bitcoin-details-screen.stories"

it("SendScreen Details", () => {
  render(
    <ContextForScreen>
      <Intraledger />
    </ContextForScreen>,
  )
})
