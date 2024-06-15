import {
  defaultPersistentState,
  migrateAndGetPersistentState,
} from "../app/store/persistent-state/state-migrations"

it("uses default state when none is present", async () => {
  const state = await migrateAndGetPersistentState({})
  expect(state).toEqual(defaultPersistentState)
})

it("migrates persistent state", async () => {
  const state = await migrateAndGetPersistentState({
    schemaVersion: 0,
    isUsdDisabled: true,
  })
  expect(state).toEqual({
    ...defaultPersistentState,
  })
})

it("returns default when schema is not present", async () => {
  const state = await migrateAndGetPersistentState({
    schemaVersion: -2,
  })
  expect(state).toEqual(defaultPersistentState)
})

it("migration from 6 to 7", async () => {
  const state6 = {
    schemaVersion: 6,
    galoyInstance: { id: "Main" },
    galoyAuthToken: "myToken",
  }

  const state7 = {
    schemaVersion: 7,
    galoyInstance: { id: "Main" },
    galoyAuthToken: "myToken",
    galoyAllAuthTokens: ["myToken"],
  }

  const res = await migrateAndGetPersistentState(state6)

  expect(res).toStrictEqual(state7)
})
