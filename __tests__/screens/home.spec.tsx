import React from "react"

import { act, render } from "@testing-library/react-native"

import { HomeScreen } from "../../app/screens/home-screen"
import { ContextForScreen } from "./helper"

jest.mock("@react-native-firebase/app-check", () => {
  return () => ({
    initializeAppCheck: jest.fn(),
    getToken: jest.fn(),
    newReactNativeFirebaseAppCheckProvider: () => ({
      configure: jest.fn(),
    }),
  })
})

jest.mock("react-native-config", () => {
  return {
    APP_CHECK_ANDROID_DEBUG_TOKEN: "token",
    APP_CHECK_IOS_DEBUG_TOKEN: "token",
  }
})

it("HomeAuthed", async () => {
  render(
    <ContextForScreen>
      <HomeScreen />
    </ContextForScreen>,
  )
  await act(async () => {})
})
