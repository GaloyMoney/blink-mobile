import {
  defaultPersistentState,
  deserializeAndMigratePersistentState,
} from "../app/store/persistent-state/state-migrations"

it("uses default state when none is present", () => {
  const state = deserializeAndMigratePersistentState({})
  expect(state).toEqual(defaultPersistentState)
})

it("migrates persistent state", () => {
  const state = deserializeAndMigratePersistentState({
    schemaVersion: 0,
    isUsdDisabled: true,
  })
  expect(state).toEqual({
    ...defaultPersistentState,
    isUsdDisabled: true,
  })
})

it("returns default when schema is not present", () => {
  const state = deserializeAndMigratePersistentState({
    schemaVersion: 3,
  })
  expect(state).toEqual(defaultPersistentState)
})
