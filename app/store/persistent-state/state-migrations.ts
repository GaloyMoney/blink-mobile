import { defaultTheme, Theme } from "@app/theme/default-theme"

type _PersistentState_0 = {
  schemaVersion: 0
  isUsdDisabled: boolean
}

type _PersistentState_1 = {
  schemaVersion: 1
  isUsdDisabled: boolean
  theme?: Theme
}

type _PersistentState_2 = {
  schemaVersion: 2
  hasShownStableSatsWelcome: boolean
  isUsdDisabled: boolean
  theme?: Theme
}

const migrate2ToCurrent = (state: _PersistentState_2): PersistentState => state

const migrate1ToCurrent = (state: _PersistentState_1): PersistentState => {
  return migrate2ToCurrent({
    ...state,
    hasShownStableSatsWelcome: false,
    schemaVersion: 2,
  })
}

const migrate0ToCurrent = (state: _PersistentState_0): PersistentState => {
  return migrate1ToCurrent({
    schemaVersion: 1,
    isUsdDisabled: state.isUsdDisabled,
    theme: defaultTheme,
  })
}

type StateMigrations = {
  0: (state: _PersistentState_0) => PersistentState
  1: (state: _PersistentState_1) => PersistentState
  2: (state: _PersistentState_2) => PersistentState
}

const stateMigrations: StateMigrations = {
  0: migrate0ToCurrent,
  1: migrate1ToCurrent,
  2: migrate2ToCurrent,
}

export type PersistentState = _PersistentState_2

export const defaultPersistentState: PersistentState = {
  schemaVersion: 2,
  hasShownStableSatsWelcome: false,
  isUsdDisabled: false,
  theme: defaultTheme,
}

export const deserializeAndMigratePersistentState = (data: any): PersistentState => {
  if (Boolean(data) && data.schemaVersion in stateMigrations) {
    try {
      const persistentState = stateMigrations[data.schemaVersion](data) as PersistentState
      return persistentState
    } catch {}
  }

  return defaultPersistentState
}
