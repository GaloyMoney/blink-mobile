import {
  defaultPersistentState,
  deserializeAndMigratePersistentState,
} from "../app/store/persistent-state/state-migrations"

it("uses default state when none is present", async () => {
  const state = await deserializeAndMigratePersistentState({})
  expect(state).toEqual(defaultPersistentState)
})

it("migrates persistent state", async () => {
  const state = await deserializeAndMigratePersistentState({
    schemaVersion: 0,
    isUsdDisabled: true,
  })
  expect(state).toEqual({
    ...defaultPersistentState,
    isUsdDisabled: true,
  })
})

it("returns default when schema is not present", async () => {
  const state = await deserializeAndMigratePersistentState({
    schemaVersion: -2,
  })
  expect(state).toEqual(defaultPersistentState)
})
