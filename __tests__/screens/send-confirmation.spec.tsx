import React from "react"

import { act, render } from "@testing-library/react-native"
import { Intraledger } from "../../app/screens/send-bitcoin-screen/send-bitcoin-confirmation-screen.stories"
import { ContextForScreen } from "./helper"

it("SendScreen Confirmation", async () => {
  const { findByLabelText } = render(
    <ContextForScreen>
      <Intraledger />
    </ContextForScreen>,
  )

  // it seems we need multiple act because the component re-render multiple times
  // probably this could be debug with why-did-you-render
  await act(async () => {})
  await act(async () => {})

  const { children } = await findByLabelText("Successful Fee")
  expect(children).toEqual(["₦0 ($0.00)"])
})
