import {
  defaultLocalStorageState,
  migrateAndGetLocalStorageState,
} from "../app/store/persistent-state/state-migrations"

it("uses default state when none is present", async () => {
  const state = await migrateAndGetLocalStorageState({})
  expect(state).toEqual(defaultLocalStorageState)
})

it("migrates persistent state", async () => {
  const state = await migrateAndGetLocalStorageState({
    schemaVersion: 0,
    isUsdDisabled: true,
  })
  expect(state).toEqual({
    ...defaultLocalStorageState,
  })
})

it("returns default when schema is not present", async () => {
  const state = await migrateAndGetLocalStorageState({
    schemaVersion: -2,
  })
  expect(state).toEqual(defaultLocalStorageState)
})

it("migration from 5 to 7", async () => {
  const state5 = {
    schemaVersion: 5,
    galoyInstance: { id: "Main" },
    galoyAuthToken: "myToken",
  }

  const state6 = {
    schemaVersion: 7,
    galoyInstance: { id: "Main" },
  }

  const res = await migrateAndGetLocalStorageState(state5)

  expect(res).toStrictEqual(state6)
})
