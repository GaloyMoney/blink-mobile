import React from "react"

import { act, render } from "@testing-library/react-native"
import { ContextForScreen } from "./helper"

import { Intraledger } from "../../app/screens/send-bitcoin-screen/send-bitcoin-details-screen.stories"

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

it("SendScreen Details", async () => {
  render(
    <ContextForScreen>
      <Intraledger />
    </ContextForScreen>,
  )
  await act(async () => {})
})
