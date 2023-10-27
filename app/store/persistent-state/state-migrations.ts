import { GALOY_INSTANCES, GaloyInstance, GaloyInstanceInput } from "@app/config"

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

type StateMigrations = {
  3: (state: PersistentState_3) => Promise<PersistentState>
  4: (state: PersistentState_4) => Promise<PersistentState>
  5: (state: PersistentState_5) => Promise<PersistentState>
  6: (state: PersistentState_6) => Promise<PersistentState>
}

const stateMigrations: StateMigrations = {
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
    const schemaVersion: 3 | 4 | 5 | 6 = data.schemaVersion
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
