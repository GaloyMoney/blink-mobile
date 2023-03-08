import React from "react"
import { HomeScreen } from "../../app/screens/home-screen"

import { render } from "@testing-library/react-native"
import { ContextForScreen } from "./helper"

it("HomeAuthed", () => {
  render(
    <ContextForScreen>
      <HomeScreen />
    </ContextForScreen>,
  )
})
