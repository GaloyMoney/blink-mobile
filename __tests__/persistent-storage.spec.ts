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

import { defaultTheme } from "@app/theme/default-theme"

it("migration from 4 to 5", async () => {
  const state4 = {
    schemaVersion: 4,
    hasShownStableSatsWelcome: false,
    isUsdDisabled: false,
    galoyInstance: {
      name: "BBW",
      graphqlUri: "https://api.mainnet.galoy.io/graphql",
      graphqlWsUri: "wss://api.mainnet.galoy.io/graphql",
      posUrl: "https://pay.bbw.sv",
      lnAddressHostname: "pay.bbw.sv",
    },
    galoyAuthToken: "myToken",
    isAnalyticsEnabled: true,
    theme: defaultTheme,
  }

  const state5 = {
    schemaVersion: 5,
    galoyInstance: { name: "BBW" },
    galoyAuthToken: "myToken",
  }

  const res = await migrateAndGetPersistentState(state4)

  expect(res).toStrictEqual(state5)
})
