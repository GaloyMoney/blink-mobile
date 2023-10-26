import jwtDecode from "jwt-decode"

import { GALOY_INSTANCES, GaloyInstance, GaloyInstanceInput } from "@app/config"
import { Network } from "@app/graphql/generated"
import { loadString } from "@app/utils/storage"

type PersistentState_0 = {
  schemaVersion: 0
  isUsdDisabled: boolean
}

type PersistentState_1 = {
  schemaVersion: 1
  isUsdDisabled: boolean
}

type PersistentState_2 = {
  schemaVersion: 2
  hasShownStableSatsWelcome: boolean
  isUsdDisabled: boolean
}

type PersistentState_3 = {
  schemaVersion: 3
  hasShownStableSatsWelcome: boolean
  isUsdDisabled: boolean
  galoyInstance: GaloyInstance
  galoyAuthToken: string
  isAnalyticsEnabled: boolean
}

type PersistentState_4 = {
  schemaVersion: 4
  hasShownStableSatsWelcome: boolean
  isUsdDisabled: boolean
  galoyInstance: GaloyInstance
  galoyAuthToken: string
  isAnalyticsEnabled: boolean
}

type PersistentState_5 = {
  schemaVersion: 5
  galoyInstance: GaloyInstanceInput
  galoyAuthToken: string
}

type PersistentState_6 = {
  schemaVersion: 6
  galoyInstance: GaloyInstanceInput
  galoyAuthToken: string
}

type JwtPayload = {
  uid: string
  network: Network
}

const decodeToken = (token: string): { uid: string; network: Network } | null => {
  try {
    const { uid, network } = jwtDecode<JwtPayload>(token)
    return { uid, network }
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.debug(err.toString())
    }
    return null
  }
}

const migrate6ToCurrent = (state: PersistentState_6): Promise<PersistentState> =>
  Promise.resolve(state)

const migrate5ToCurrent = (state: PersistentState_5): Promise<PersistentState> => {
  return migrate6ToCurrent({
    ...state,
    schemaVersion: 6,
  })
}

const migrate4ToCurrent = (state: PersistentState_4): Promise<PersistentState> => {
  const newGaloyInstance = GALOY_INSTANCES.find(
    (instance) => instance.name === state.galoyInstance.name,
  )

  if (!newGaloyInstance) {
    if (state.galoyInstance.name === "BBW") {
      const newGaloyInstanceTest = GALOY_INSTANCES.find(
        (instance) => instance.name === "Blink",
      )

      if (!newGaloyInstanceTest) {
        throw new Error("Galoy instance not found")
      }
    }
  }

  let galoyInstance: GaloyInstanceInput

  if (state.galoyInstance.name === "Custom") {
    // we only keep the full object if we are on Custom
    // otherwise data will be stored in GaloyInstancesInput[]
    galoyInstance = { ...state.galoyInstance, id: "Custom" }
  } else if (state.galoyInstance.name === "BBW" || state.galoyInstance.name === "Blink") {
    // we are using "Main" instead of "BBW", so that the bankName is not hardcoded in the saved json
    galoyInstance = { id: "Main" } as const
  } else {
    galoyInstance = { id: state.galoyInstance.name as "Staging" | "Local" }
  }

  return migrate5ToCurrent({
    schemaVersion: 5,
    galoyAuthToken: state.galoyAuthToken,
    galoyInstance,
  })
}

const migrate3ToCurrent = (state: PersistentState_3): Promise<PersistentState> => {
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

const migrate2ToCurrent = async (state: PersistentState_2): Promise<PersistentState> => {
  const LEGACY_TOKEN_KEY = "GaloyToken"
  const token = await loadString(LEGACY_TOKEN_KEY)

  if (token && decodeToken(token)) {
    const decodedToken = decodeToken(token)
    const network = decodedToken?.network
    if (network === "mainnet") {
      const galoyInstance = GALOY_INSTANCES.find(
        (instance) => instance.name === "BBW" || instance.name === "Blink",
      )
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

  const newGaloyInstance = GALOY_INSTANCES.find(
    (instance) => instance.name === "BBW" || instance.name === "Blink",
  )
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

const migrate1ToCurrent = (state: PersistentState_1): Promise<PersistentState> => {
  return migrate2ToCurrent({
    ...state,
    hasShownStableSatsWelcome: false,
    schemaVersion: 2,
  })
}

const migrate0ToCurrent = (state: PersistentState_0): Promise<PersistentState> => {
  return migrate1ToCurrent({
    schemaVersion: 1,
    isUsdDisabled: state.isUsdDisabled,
  })
}

type StateMigrations = {
  0: (state: PersistentState_0) => Promise<PersistentState>
  1: (state: PersistentState_1) => Promise<PersistentState>
  2: (state: PersistentState_2) => Promise<PersistentState>
  3: (state: PersistentState_3) => Promise<PersistentState>
  4: (state: PersistentState_4) => Promise<PersistentState>
  5: (state: PersistentState_5) => Promise<PersistentState>
  6: (state: PersistentState_6) => Promise<PersistentState>
}

const stateMigrations: StateMigrations = {
  0: migrate0ToCurrent,
  1: migrate1ToCurrent,
  2: migrate2ToCurrent,
  3: migrate3ToCurrent,
  4: migrate4ToCurrent,
  5: migrate5ToCurrent,
  6: migrate6ToCurrent,
}

export type PersistentState = PersistentState_6

export const defaultPersistentState: PersistentState = {
  schemaVersion: 6,
  galoyInstance: { id: "Main" },
  galoyAuthToken: "",
}

export const migrateAndGetPersistentState = async (
  // TODO: pass the correct type.
  // this is especially important given this is migration code and it's hard to test manually
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
): Promise<PersistentState> => {
  if (Boolean(data) && data.schemaVersion in stateMigrations) {
    const schemaVersion: 0 | 1 | 2 | 3 | 4 | 5 = data.schemaVersion
    try {
      const migration = stateMigrations[schemaVersion]
      const persistentState = await migration(data)
      if (persistentState) {
        return persistentState
      }
    } catch (err) {
      console.error({ err }, "error migrating persistent state")
    }
  }

  return defaultPersistentState
}
