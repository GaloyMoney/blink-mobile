import { loadJson, saveJson } from "@app/utils/storage"
import { createContext, useContext, PropsWithChildren } from "react"
import {
  defaultPersistentState,
  migrateAndGetPersistentState,
  PersistentState,
} from "./state-migrations"
import * as React from "react"
import { useAppDispatch } from "../redux"

const PERSISTENT_STATE_KEY = "persistentState"

const loadPersistentState = async (): Promise<PersistentState> => {
  const data = await loadJson(PERSISTENT_STATE_KEY)
  return migrateAndGetPersistentState(data)
}

const savePersistentState = async (state: PersistentState) => {
  return saveJson(PERSISTENT_STATE_KEY, state)
}

// TODO: should not be exported
export type PersistentStateContextType = {
  persistentState: PersistentState
  updateState: (
    update: (state: PersistentState | undefined) => PersistentState | undefined,
  ) => void
  resetState: () => void
}

// TODO: should not be exported
export const PersistentStateContext = createContext<PersistentStateContextType | null>(
  null,
)

export const PersistentStateProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const dispatch = useAppDispatch()
  const [persistentState, setPersistentState] = React.useState<
    PersistentState | undefined
  >(undefined)

  React.useEffect(() => {
    if (persistentState) {
      savePersistentState(persistentState)
    }
  }, [persistentState])

  React.useEffect(() => {
    ;(async () => {
      const loadedState = await loadPersistentState()
      setPersistentState(loadedState)
    })()
  }, [])

  const resetState = React.useCallback(() => {
    setPersistentState(defaultPersistentState)
  }, [])

  return persistentState ? (
    <PersistentStateContext.Provider
      value={{ persistentState, updateState: setPersistentState, resetState }}
    >
      {children}
    </PersistentStateContext.Provider>
  ) : null
}

export const usePersistentStateContext = (() =>
  useContext(PersistentStateContext)) as () => PersistentStateContextType
