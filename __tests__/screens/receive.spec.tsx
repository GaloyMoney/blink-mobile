import React from "react"

import { render } from "@testing-library/react-native"
import { Wrapping } from "./helper"
import ReceiveWrapperScreen from "@app/screens/receive-bitcoin-screen/receive-wrapper"

it("Receive", () => {
  render(
    <Wrapping>
      <ReceiveWrapperScreen />
    </Wrapping>,
  )
})
