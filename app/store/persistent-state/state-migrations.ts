import jwtDecode from "jwt-decode"

import { GALOY_INSTANCES, GaloyInstance } from "@app/config"
import { Network } from "@app/graphql/generated"
import { defaultTheme, Theme } from "@app/theme/default-theme"
import { loadString } from "@app/utils/storage"

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

type _PersistentState_3 = {
  schemaVersion: 3
  hasShownStableSatsWelcome: boolean
  isUsdDisabled: boolean
  galoyInstance: GaloyInstance
  galoyAuthToken: string
  isAnalyticsEnabled: boolean
  theme?: Theme
}

type _PersistentState_4 = {
  schemaVersion: 4
  hasShownStableSatsWelcome: boolean
  isUsdDisabled: boolean
  galoyInstance: GaloyInstance
  galoyAuthToken: string
  isAnalyticsEnabled: boolean
  theme?: Theme
}

const decodeToken = (token: string): { uid: string; network: Network } | null => {
  try {
    const { uid, network } = jwtDecode<JwtPayload>(token)
    return { uid, network }
  } catch (err) {
    console.debug(err.toString())
    return null
  }
}

const migrate4ToCurrent = (state: _PersistentState_4): Promise<PersistentState> =>
  Promise.resolve(state)

const migrate3ToCurrent = (state: _PersistentState_3): Promise<PersistentState> => {
  const newGaloyInstance = GALOY_INSTANCES.find(
    (instance) => instance.name === state.galoyInstance.name,
  )

  if (!newGaloyInstance) {
    throw new Error("Galoy instance not found")
  }

  return migrate4ToCurrent({
    ...state,
    galoyInstance: newGaloyInstance,
    schemaVersion: 4,
  })
}

const migrate2ToCurrent = async (state: _PersistentState_2): Promise<PersistentState> => {
  const LEGACY_TOKEN_KEY = "GaloyToken"
  const token = await loadString(LEGACY_TOKEN_KEY)

  if (token && decodeToken(token)) {
    const decodedToken = decodeToken(token)
    const network = decodedToken?.network
    if (network === "mainnet") {
      const galoyInstance = GALOY_INSTANCES.find((instance) => instance.name === "BBW")
      if (galoyInstance) {
        return migrate3ToCurrent({
          ...state,
          schemaVersion: 3,
          galoyInstance,
          galoyAuthToken: token,
          isAnalyticsEnabled: true,
        })
      }
    }
  }

  const newGaloyInstance = GALOY_INSTANCES.find((instance) => instance.name === "BBW")
  if (!newGaloyInstance) {
    throw new Error("Galoy instance not found")
  }

  return migrate3ToCurrent({
    ...state,
    schemaVersion: 3,
    galoyInstance: newGaloyInstance,
    galoyAuthToken: "",
    isAnalyticsEnabled: true,
  })
}

const migrate1ToCurrent = (state: _PersistentState_1): Promise<PersistentState> => {
  return migrate2ToCurrent({
    ...state,
    hasShownStableSatsWelcome: false,
    schemaVersion: 2,
  })
}

const migrate0ToCurrent = (state: _PersistentState_0): Promise<PersistentState> => {
  return migrate1ToCurrent({
    schemaVersion: 1,
    isUsdDisabled: state.isUsdDisabled,
    theme: defaultTheme,
  })
}

type StateMigrations = {
  0: (state: _PersistentState_0) => Promise<PersistentState>
  1: (state: _PersistentState_1) => Promise<PersistentState>
  2: (state: _PersistentState_2) => Promise<PersistentState>
  3: (state: _PersistentState_3) => Promise<PersistentState>
  4: (state: _PersistentState_4) => Promise<PersistentState>
}

const stateMigrations: StateMigrations = {
  0: migrate0ToCurrent,
  1: migrate1ToCurrent,
  2: migrate2ToCurrent,
  3: migrate3ToCurrent,
  4: migrate4ToCurrent,
}

export type PersistentState = _PersistentState_4

export const defaultPersistentState: PersistentState = {
  schemaVersion: 4,
  hasShownStableSatsWelcome: false,
  isUsdDisabled: false,
  galoyInstance: GALOY_INSTANCES[0],
  galoyAuthToken: "",
  isAnalyticsEnabled: true,
  theme: defaultTheme,
}

export const deserializeAndMigratePersistentState = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
): Promise<PersistentState> => {
  if (Boolean(data) && data.schemaVersion in stateMigrations) {
    try {
      const migration = stateMigrations[data.schemaVersion]
      const persistentState = (await migration(data)) as PersistentState
      if (persistentState) {
        return persistentState
      }
    } catch {}
  }

  return defaultPersistentState
}
