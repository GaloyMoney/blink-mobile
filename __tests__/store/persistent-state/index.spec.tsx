import React from "react"

import { MockConsumer } from "@app/store/mock-consumer"
import { PersistentStateProvider } from "@app/store/persistent-state"
import KeyStoreWrapper from "@app/utils/storage/secureStorage"
import { act, render } from "@testing-library/react-native"

describe("PersistentStateProvider", () => {
  it("loads and saves persistent state correctly", async () => {
    const getSecureStorageStateSpy = jest.spyOn(KeyStoreWrapper, "getSecureStorageState")
    const setSecureStorageStateSpy = jest.spyOn(KeyStoreWrapper, "setSecureStorageState")
    render(
      <PersistentStateProvider>
        <MockConsumer />
      </PersistentStateProvider>,
    )
    await act(async () => {})
    expect(getSecureStorageStateSpy).toHaveBeenCalled()
    expect(setSecureStorageStateSpy).toHaveBeenCalled()
  })
})
