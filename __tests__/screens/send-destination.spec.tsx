import React from "react"

import SendBitcoinDestinationScreen from "@app/screens/send-bitcoin-screen/send-bitcoin-destination-screen"
import { act, render } from "@testing-library/react-native"
import { ContextForScreen } from "./helper"

const sendBitcoinDestination = {
  name: "sendBitcoinDestination",
  key: "sendBitcoinDestination",
  params: {
    payment: "",
    username: "",
  },
} as const

it("SendScreen Destination", async () => {
  render(
    <ContextForScreen>
      <SendBitcoinDestinationScreen route={sendBitcoinDestination} />
    </ContextForScreen>,
  )
  await act(async () => {})
})
