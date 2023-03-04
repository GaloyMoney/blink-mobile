import React from "react"

import SendBitcoinDestinationScreen from "@app/screens/send-bitcoin-screen/send-bitcoin-destination-screen"
import { render } from "@testing-library/react-native"
import { Wrapping } from "./helper"

const sendBitcoinDestination = {
  name: "sendBitcoinDestination",
  key: "sendBitcoinDestination",
  params: {
    payment: "",
    username: "",
  },
} as const

it("SendScreen Destination", () => {
  render(
    <Wrapping>
      <SendBitcoinDestinationScreen route={sendBitcoinDestination} />
    </Wrapping>,
  )
})
