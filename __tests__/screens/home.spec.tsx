import React from "react"
import { HomeScreen } from "../../app/screens/home-screen"

import { act, render } from "@testing-library/react-native"
import { ContextForScreen } from "./helper"

it("HomeAuthed", async () => {
  render(
    <ContextForScreen>
      <HomeScreen />
    </ContextForScreen>,
  )
  await act(async () => {})
})
