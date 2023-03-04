import React from "react"
import { HomeScreen } from "../../app/screens/home-screen"

import { render } from "@testing-library/react-native"
import { Wrapping } from "./helper"

it("HomeAuthed", () => {
  render(
    <Wrapping>
      <HomeScreen />
    </Wrapping>,
  )
})
